import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsAuth {
  private static _instance: GoogleSheetsAuth;
  private initialized: Promise<void> | null;
  private googleSheets: sheets_v4.Sheets | null;

  constructor() {
    this.initialized = null;
    this.googleSheets = null;
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new GoogleSheetsAuth();
    return this._instance;
  }

  private async init() {
    if (!this.initialized) {
      this.initialized = this.setupAuth();
    }

    return this.initialized;
  }

  private setupAuth = async () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const googleClient = await auth.getClient();

    // Instance of Google Sheets API
    this.googleSheets = google.sheets({ version: "v4", auth: googleClient });
  };

  public async getSheetsAPI(): Promise<sheets_v4.Sheets | null> {
    await this.init();
    return this.googleSheets;
  }
}

export default GoogleSheetsAuth;
