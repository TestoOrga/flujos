sap.ui.define(
  ["sap/ui/base/Object", "sap/base/Log"],
  function (BaseObject, Log) {
    "use strict";

    return BaseObject.extend("bf.exp.bafarexp.controller.OneDriveController", {
      /* =========================================================== */
      /* drive configuration                                         */
      /* =========================================================== */
      constructor: function (oComponent) {
        var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
        this._oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
      },
      fetchToken: function () {
        return this.getTokenBack().then((response) => {
          console.log("habemus Token");
          if (response) {
            this.token = response.access_token;
            this.tokenType = response.token_type;
            this.tokenValidUntil = Date.now() + (response.expires_in * 1000);
          }
          // callback(file, panelId);
        }).catch(function (error) {
          this.sendTokenError(error)
        }.bind(this));
      },
      loginDrive: function () {
        return new Promise((resolve, reject) => {
          resolve("noLogin");
        });
      },
      getTokenBack: function () {
        var entitySet = "/TokenSet('o')"
        var that = this;
        return new Promise((resolve, reject) => {
          // time in millisecs || token is still valid?
          if (this.tokenValidUntil > Date.now()) {
            resolve();
          } else {
            that._oModel.read(entitySet, {
              async: true,
              success: function (req, res) {
                resolve(res.data);
              },
              error: function (error) {
                reject(error);
              }
            })
          }
        })
      },
      sendTokenError: function (error) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("driveAnswer", "tokenError", {
          res: error
        });
      },
      /* =========================================================== */
      /* Upload                                                      */
      /* =========================================================== */
      UploadFiles: function (aFiles) {
        this.fetchToken().then(res => {
          this.processInputFile.bind(this), {
            file: file,
            oFileBack: oFileBack,
            path: path,
            panelId: panelId,
          };
        });
      },
      //turns file uploaded into blob and calls upload routines
      processInputFile: function (oInFile) {
        if (readerEvt.total > 4000000) {
          this.uploadLargeFile({
                fileName: oInFile.oFileBack.Archivo + "." + Ext,
                fileData: fileData,
              },
              oInFile.oFileBack.Ruta + fileFolder)
            .then(
              function (res) {
                this.sendResults(res, oInFile.panelId, oInFile.oFileBack);
              }.bind(this))
            .catch(function (error) {
              this.sendError(error, oInFile.panelId, oInFile.oFileBack);
            }.bind(this));
        } else {
          // small files
          this.uploadToDrive(
              fileData,
              oInFile.oFileBack.Archivo + "." + Ext,
              oInFile.oFileBack.Ruta + fileFolder)
            .then(
              function (res) {
                this.sendResults(res, oInFile.panelId, oInFile.oFileBack);
              }.bind(this))
            .catch(function (error) {
              this.sendError(error, oInFile.panelId, oInFile.oFileBack)
            }.bind(this));
        }
      },
      processPhoto: function (inPhoto) {
        var byteCharacters = atob(inPhoto.file.split(",")[1]);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        // convert this array of byte values into a real typed byte array by passing it to the Uint8Array constructor.
        if (sap.ui.Device.browser.name === "ie") {
          var byteArray = Uint8Array(byteNumbers);
        } else {
          byteArray = new Uint8Array(byteNumbers);
        }
        // This in turn can be converted to a BLOB by wrapping it in an array and passing it to the Blob constructor.
        var fileData = new Blob([byteArray], {
          type: "image/jpeg",
        });
        return fileData;
      },
      /* =========================================================== */
      //sends result via events
      sendResults: function (oRes, panelId, oFileBack) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("driveAnswer", "fileUploaded", {
          result: oRes,
          panel: panelId,
          oFileBack: oFileBack,
        });
      },
      sendError: function (oRes, panelId, oFileBack) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("driveAnswer", "fileUploadError", {
          result: oRes,
          panel: panelId,
          oFileBack: oFileBack,
        });
      },
      /* =========================================================== */
      uploadToDrive: function (fileData, fileName, fileFolder) {
        console.log("upload");
        var rootPath = "";
        var driveURL =
          "https://graph.microsoft.com/v1.0/3e67a7ed-0ddf-4afa-ba03-f204fad6d749/users/d9b62329-106b-4b3d-83f6-919c6f76b457/drive/root:/" +
          rootPath +
          fileFolder +
          "/" +
          fileName +
          ":/content";
        return new Promise((resolve, reject) => {
          $.ajax({
            type: "PUT",
            headers: {
              Authorization: this.tokenType + " " + this.token,
            },
            url: driveURL,
            data: fileData,
            processData: false,
            success: function (d, a, e, f) {
              console.log("upload to drive small file");
              resolve(d);
            },
            error: function (e, r) {
              console.log("fail to upload to drive small file");
              console.log(e);
              reject(e);
            },
          });
        });
      },
      /* =========================================================== */
      // first create a session then send bytes to session url
      uploadLargeFile: function (oFile, fileFolder) {
        return new Promise((resolve, reject) => {
          this.uploadSession({
              fileSize: oFile.fileData.size,
              fileName: oFile.fileName,
              fileFolder: fileFolder
            })
            .then(function (sessionRes) {
              this.uploadBytes(oFile.fileData, sessionRes).then(function (res) {
                resolve(res);
              }).catch(function (error) {
                reject(error)
              });
            }.bind(this))
            .catch(function (error) {
              reject(error)
            });
        });
      },
      uploadSession: function (oItem) {
        var data = {
          item: {
            "@microsoft.graph.conflictBehavior": "replace",
            description: "description",
            fileSize: oItem.fileSize,
            name: oItem.fileName,
          },
        };
        return new Promise((resolve, reject) => {
          var path =
            "https://graph.microsoft.com/v1.0/3e67a7ed-0ddf-4afa-ba03-f204fad6d749/users/d9b62329-106b-4b3d-83f6-919c6f76b457/drive/root:/" +
            oItem.fileFolder +
            "/" +
            oItem.fileName +
            ":/createUploadSession";
          $.ajax({
            type: "POST",
            url: path,
            headers: {
              Authorization: this.tokenType + " " + this.token,
            },
            success: function (res, res1) {
              console.log("session");
              resolve(res);
            },
            error: function (res, res1) {
              console.log("nosession");
              reject(res);
            },
          });
        });
      },
      uploadBytes: function (oFilePart, oSession) {
        return new Promise((resolve, reject) => {
          var range = "bytes " + "0-" + (oFilePart.size - 1) + "/" + oFilePart.size;
          var formData = new FormData();
          formData.append("Content-Range", range);
          $.ajax({

            type: "PUT",
            url: oSession.uploadUrl,
            headers: {
              "Content-Range": range
            },
            data: oFilePart,
            processData: false,
            success: function (res, res1) {
              console.log("upload");
              resolve(res);
            },
            error: function (res, res1) {
              console.log("noupload");
              reject(res);
            },
          });
        });
      },
      /* =========================================================== */
      /* Download                                                    */
      /* =========================================================== */
      // first try to use file id, if fail then try to get file info via name and path, the download via id 
      downloadFile: function (id, path, fileName) {
        this.loginDrive().then(
          function (resolve) {
            if (id) {
              var oParam = {
                id: id,
                ctx: undefined,
                oFile: {
                  id: undefined,
                  path: path,
                  fileName: fileName
                },
              };
              this.fetchToken(this.downloadSingleFile.bind(this), oParam);
            } else {
              oParam = {
                path: path,
                fileName: fileName,
                callback: this.downloadSingleFile,
              };
              this.fetchToken(this.getFileInfo.bind(this), oParam);
            }
          }.bind(this)
        );
      },
      getFileInfo: function ({
        path,
        fileName,
        callback,
        ctx,
        panelTab
      }) {
        var driveURL =
          "https://graph.microsoft.com/v1.0/3e67a7ed-0ddf-4afa-ba03-f204fad6d749/users/d9b62329-106b-4b3d-83f6-919c6f76b457/drive/root:/" +
          path +
          "/" +
          fileName;
        var that = !ctx ? this : ctx;
        $.ajax({
          type: "GET",
          headers: {
            Authorization: that.tokenType + " " + that.token,
          },
          url: driveURL,
          processData: false,
          success: function (res) {
            var oParam = {
              id: res.id,
              ctx: that,
              undefined,
              undefined,
              panelTab: panelTab ? panelTab : undefined,
            };
            callback(oParam);
          }.bind(that),
          error: function (odata) {
            console.log(odata);
            var oEventBus = sap.ui.getCore().getEventBus();
            odata.fileName = fileName;
            odata.panelTab = panelTab;
            oEventBus.publish("driveAnswer", "errorDataInfo", odata);
          },
        });
      },
      downloadSingleFile: function ({
        id,
        ctx,
        oFile
      }) {
        var driveURL = "https://graph.microsoft.com/v1.0/3e67a7ed-0ddf-4afa-ba03-f204fad6d749/users/d9b62329-106b-4b3d-83f6-919c6f76b457/drive/items/" + id;
        var that = !ctx ? this : ctx;
        $.ajax({
          type: "GET",
          headers: {
            Authorization: that.tokenType + " " + that.token,
          },
          url: driveURL,
          processData: false,
          success: function (odata) {
            var sURL = odata["@microsoft.graph.downloadUrl"];
            // this.urls.push(sURL);
            // sap.m.URLHelper.redirect(odata['@microsoft.graph.downloadUrl']);
            window.open(sURL, "_blank");
            console.log(odata.name);
            console.log(sURL);
          }.bind(that),
          error: function (odata) {
            that.downloadFile(oFile.id, oFile.path, oFile.fileName, that);
          },
        });
      },
      /* =========================================================== */
      /* Delete                                                      */
      /* =========================================================== */
      // first try to use file id, if fail then try to get file info via name and path, the delete via id 
      deleteFile: function (id, path, fileName, ctx, panelTab) {
        this.loginDrive()
          .then(
            function (resolve) {
              if (id) {
                var oParam = {
                  id: id,
                  ctx: undefined,
                  oFile: {
                    id: undefined,
                    path: path,
                    fileName: fileName
                  },
                  panelTab,
                };
                this.fetchToken(this.deleteSingleFile.bind(this), oParam);
              } else {
                oParam = {
                  path: path,
                  fileName: fileName,
                  callback: this.deleteSingleFile,
                  ctx,
                  panelTab,
                };
                this.fetchToken(this.getFileInfo.bind(this), oParam);
              }
            }.bind(this)
          )
          .catch(function () {

          }.bind(this));
      },
      deleteSingleFile: function ({
        id,
        ctx,
        oFile,
        panelTab
      }) {

        var driveURL = "https://graph.microsoft.com/v1.0/me/drive/items/" + id;
        var driveURL = "https://graph.microsoft.com/v1.0/3e67a7ed-0ddf-4afa-ba03-f204fad6d749/users/d9b62329-106b-4b3d-83f6-919c6f76b457/drive/items/" + id;
        var that = !ctx ? this : ctx;
        $.ajax({
          type: "DELETE",
          headers: {
            Authorization: that.tokenType + " " + that.token,
          },
          url: driveURL,
          processData: false,
          success: function (odata) {
            var oEventBus = sap.ui.getCore().getEventBus();
            if (!odata) {
              var odata = {};
            }
            odata.panelTab = panelTab;
            oEventBus.publish("driveAnswer", "deleted", odata);
            console.log(odata);
          }.bind(that),
          error: function (odata) {
            if (oFile) {
              that.deleteFile(
                oFile.id,
                oFile.path,
                oFile.fileName,
                that,
                panelTab
              );
            } else {
              odata.panelTab = panelTab;
              var oEventBus = sap.ui.getCore().getEventBus();
              oEventBus.publish("driveAnswer", "deletedError", odata);
              console.log(odata);
            }
          },
        });
      },
    });
  }
);