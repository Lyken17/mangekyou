"use strict";function _interopRequireDefault(i){return i&&i.__esModule?i:{"default":i}}var _electron=require("electron"),_browserWindow=require("browser-window"),_browserWindow2=_interopRequireDefault(_browserWindow);require("crash-reporter").start();var mainWindow=null;_electron.app.on("window-all-closed",function(){_electron.app.quit()}),_electron.app.on("ready",function(){var i={width:800,height:600,"min-width":800,"min-height":600,frame:!1,show:!1};mainWindow=new _browserWindow2["default"](i),mainWindow.loadURL("file://"+__dirname+"/index.html"),mainWindow.show(),mainWindow.on("closed",function(){mainWindow=null}),_electron.ipcMain.on("Wminimize",function(){mainWindow.minimize()}),_electron.ipcMain.on("Wmaximize",function(){mainWindow.isMaximized()?mainWindow.unmaximize():mainWindow.maximize()}),_electron.ipcMain.on("Wclose",function(){mainWindow.close()}),_electron.ipcMain.on("Wreload",function(){mainWindow.reload()})});