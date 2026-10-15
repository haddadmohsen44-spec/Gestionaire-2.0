const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0B0F19',
    title: 'DentiDZ Pro - Logiciel Dentaire Professionnel Algérien',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
    show: false, // Wait until ready to show to prevent white flash
  });

  // Load the built Vite production index.html
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath).catch((err) => {
    console.error('Failed to load local HTML file, falling back:', err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Custom Desktop Menu
  const template = [
    {
      label: 'Cabinet',
      submenu: [
        { label: 'Recharger l\'application (F5)', accelerator: 'F5', click: () => mainWindow.reload() },
        { label: 'Plein Écran', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Quitter DentiDZ Pro', accelerator: 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'Impression',
      submenu: [
        {
          label: 'Imprimer Ordonnance / Reçu (Ctrl+P)',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.print({ silent: false, printBackground: true }),
        },
      ],
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de DentiDZ Pro',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'DentiDZ Pro v1.0.0',
              message: 'DentiDZ Pro - Solution Dentaire Algérienne',
              detail: 'Logiciel de gestion de cabinet dentaire autonome avec synchronisation réseau local P2P, odontogramme FDI et ordonnances algériennes.\n\nConçu pour le Praticien et son Équipe.',
              buttons: ['Fermer'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance lock so the dentist cannot accidentally open 10 copies on Windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
