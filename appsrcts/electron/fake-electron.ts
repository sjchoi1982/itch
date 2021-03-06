
import { EventEmitter } from "events";

const rnil = (): any => null;

const electron = {
  app: {
    getVersion: () => "1.0",
    getPath: (p: string): string => `tmp/${p}`,
    makeSingleInstance: (cb: () => void) => false,
    quit: rnil,
    on: rnil,
    dock: {
      setMenu: rnil,
      bounce: rnil,
      setBadge: rnil,
    },
  },
  powerSaveBlocker: {
    start: rnil,
    stop: rnil,
  },
  ipcMain: Object.assign({}, EventEmitter.prototype),
  ipcRenderer: Object.assign({
    send: function () {
      let args: Array<any> = [];
      for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      args.splice(1, 0, {}); // inject fake 'ev' object
      electron.ipcMain.emit.apply(electron.ipcMain, args);
    },
  }, EventEmitter.prototype),
  remote: {
    require: (path: string): any => ({}),
    app: null as any,
  },
  shell: {
    openItem: rnil,
    openExternal: rnil,
  },
  dialog: {
    showMessageBox: rnil,
  },
  webFrame: {
    setZoomLevelLimits: rnil,
  },
  Menu: {
    buildFromTemplate: rnil,
    setApplicationMenu: rnil,
  },
  Tray: function () {
    Object.assign(this, electron.Tray);
  },
  BrowserWindow: function () {
    Object.assign(this, electron.BrowserWindow);
  },
};

electron.ipcRenderer.setMaxListeners(Infinity);
electron.ipcMain.setMaxListeners(Infinity);

electron.remote.app = electron.app;

Object.assign(electron.Tray, {
  setToolTip: rnil,
  setContextMenu: rnil,
  on: rnil,
  displayBalloon: rnil, // win32-only
});

let webRequest = {
  onBeforeSendHeaders: rnil,
};

let session = {
  clearCache: (f: () => void) => f(),
  webRequest,
};

let webContents = {
  on: (e: string, cb: (e: any) => void) => cb({ preventDefault: rnil }),
  executeJavaScript: rnil,
  insertCSS: rnil,
  openDevTools: rnil,
  getUserAgent: () => "tester",
  setUserAgent: rnil,
  session,
};

Object.assign(electron.BrowserWindow, {
  getAllWindows: (): Array<any> => [],
  getFocusedWindow: () => null,
  setProgressBar: rnil,
  on: rnil,
  loadURL: rnil,
  setMenu: rnil,
  hide: rnil,
  show: rnil,
  close: rnil,
  webContents,
});

export default electron;
