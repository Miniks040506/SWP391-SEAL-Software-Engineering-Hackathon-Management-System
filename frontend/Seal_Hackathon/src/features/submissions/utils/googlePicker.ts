import type { GoogleDrivePickerSession } from "@/api/googleDrive.api";

export type GooglePickerFile = {
  fileId: string;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
};

type PickerData = Record<string, unknown>;

type DocsView = {
  setIncludeFolders(value: boolean): DocsView;
  setSelectFolderEnabled(value: boolean): DocsView;
  setMimeTypes(value: string): DocsView;
};

type PickerBuilder = {
  addView(view: DocsView): PickerBuilder;
  setAppId(appId: string): PickerBuilder;
  setDeveloperKey(apiKey: string): PickerBuilder;
  setOAuthToken(accessToken: string): PickerBuilder;
  setCallback(callback: (data: PickerData) => void): PickerBuilder;
  build(): { setVisible(visible: boolean): void };
};

type PickerNamespace = {
  Action: { PICKED: string; CANCEL: string };
  Response: { ACTION: string; DOCUMENTS: string };
  Document: {
    ID: string;
    NAME: string;
    MIME_TYPE: string;
    SIZE_BYTES: string;
  };
  ViewId: { DOCS: string };
  DocsView: new (viewId: string) => DocsView;
  PickerBuilder: new () => PickerBuilder;
};

type GoogleApiWindow = Window & {
  gapi?: {
    load(
      name: string,
      config: {
        callback: () => void;
        onerror: () => void;
        timeout: number;
        ontimeout: () => void;
      },
    ): void;
  };
  google?: { picker?: PickerNamespace };
};

const GOOGLE_API_SCRIPT_ID = "seal-google-api";
let pickerLoader: Promise<PickerNamespace> | null = null;

function loadGoogleApiScript() {
  const googleWindow = window as GoogleApiWindow;
  if (googleWindow.gapi) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      GOOGLE_API_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Google Picker could not be loaded.")),
      { once: true },
    );
    if (!existing) {
      script.id = GOOGLE_API_SCRIPT_ID;
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

async function loadPicker(): Promise<PickerNamespace> {
  if (pickerLoader) return pickerLoader;

  pickerLoader = loadGoogleApiScript().then(
    () =>
      new Promise<PickerNamespace>((resolve, reject) => {
        const googleWindow = window as GoogleApiWindow;
        if (!googleWindow.gapi) {
          reject(new Error("Google API did not initialize."));
          return;
        }
        googleWindow.gapi.load("picker", {
          callback: () => {
            const picker = googleWindow.google?.picker;
            if (picker) resolve(picker);
            else reject(new Error("Google Picker did not initialize."));
          },
          onerror: () => reject(new Error("Google Picker could not be loaded.")),
          timeout: 10_000,
          ontimeout: () => reject(new Error("Google Picker loading timed out.")),
        });
      }),
  );

  try {
    return await pickerLoader;
  } catch (error) {
    pickerLoader = null;
    throw error;
  }
}

export async function chooseGoogleDriveFile(
  session: GoogleDrivePickerSession,
  acceptedMimeTypes: string[] = [],
): Promise<GooglePickerFile | null> {
  const picker = await loadPicker();
  const view = new picker.DocsView(picker.ViewId.DOCS)
    .setIncludeFolders(false)
    .setSelectFolderEnabled(false);
  if (acceptedMimeTypes.length > 0) {
    view.setMimeTypes(acceptedMimeTypes.join(","));
  }

  return new Promise((resolve) => {
    new picker.PickerBuilder()
      .addView(view)
      .setAppId(session.appId)
      .setDeveloperKey(session.pickerApiKey)
      .setOAuthToken(session.accessToken)
      .setCallback((data) => {
        const action = data[picker.Response.ACTION];
        if (action === picker.Action.CANCEL) {
          resolve(null);
          return;
        }
        if (action !== picker.Action.PICKED) return;

        const documents = data[picker.Response.DOCUMENTS];
        const document = Array.isArray(documents) ? documents[0] : null;
        if (!document || typeof document !== "object") {
          resolve(null);
          return;
        }
        const fields = document as Record<string, unknown>;
        const fileId = fields[picker.Document.ID];
        const name = fields[picker.Document.NAME];
        if (typeof fileId !== "string" || typeof name !== "string") {
          resolve(null);
          return;
        }

        const rawSize = fields[picker.Document.SIZE_BYTES];
        const parsedSize = Number(rawSize);
        resolve({
          fileId,
          name,
          mimeType:
            typeof fields[picker.Document.MIME_TYPE] === "string"
              ? (fields[picker.Document.MIME_TYPE] as string)
              : undefined,
          sizeBytes: Number.isFinite(parsedSize) ? parsedSize : undefined,
        });
      })
      .build()
      .setVisible(true);
  });
}
