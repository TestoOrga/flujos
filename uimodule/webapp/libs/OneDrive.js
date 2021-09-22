sap.ui.define(
  ["sap/ui/base/Object", "sap/base/Log",
    "sap/m/MessageBox"
  ],
  function (Object,
    Log,
    MessageBox) {
    "use strict";

    return Object.extend("bafar.flujos.flujos.libs.OneDrive", {
      /* =========================================================== */
      /* drive configuration                                         */
      /* =========================================================== */
      constructor: function (oComponent) {
        this.oComponent = oComponent
        var sServiceUrl = "/sap/opu/odata/sap/ZOD_ONEDRIVE_SRV";
        this._oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);

        var sServiceUrl1 = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
        this._oModelCat = new sap.ui.model.odata.v2.ODataModel(sServiceUrl1, true);

        var sServiceUrl2 = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        this._oModelCreate = new sap.ui.model.odata.v2.ODataModel(sServiceUrl2, true);
      },
      testo: function () {
        console.log("testo OneDrive");
        return 1;
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
        // return new Promise((resolve, reject) => {
        //   resolve("noLogin");
        // });
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
      /* Rutas                                                       */
      /* =========================================================== */
      currDate: function () {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0");
        var yyyy = today.getFullYear();
        return yyyy + mm + dd;
      },
      getRoutesFromBack: function (oFile) {
        var oPayload = {
          P1: "ONEDRIVE",
          P2: this.oComponent.flowData.departamento,
          P3: this.oComponent.flowData.actividad,
          P4: this.oComponent.flowData.proceso,
          P5: this.currDate(),
          P6: this.oComponent.flowData.id,
          P7: oFile.itemId,
          to_pesal: []
        };
        return this.oComponent.getCatDataComp(oPayload, this._oModelCat);
      },
      /* =========================================================== */
      /* informar Back                                               */
      /* =========================================================== */
      submitToBack: function (oRes, oFile, oRoutes) {
        var oPayload = {
          P1: "SENDONEDRIVE",
          to_pesal: [{
            C2: this.oComponent.flowData.departamento,
            C3: this.oComponent.flowData.actividad,
            C4: this.oComponent.flowData.proceso,
            C5: this.currDate(),
            C6: this.oComponent.flowData.id,
            C7: oFile.itemId,
            C8: oRoutes.C1,
            C9: oRoutes.C2,
            C10: oRoutes.C3,
            C11: oFile.fileName,
            C12: oFile.fileExt,
            C13: oRes.id
          }, ],
        };
        var that = this;
        this._oModelCreate.create("/BaseSet", oPayload, {
          async: true,
          success: function (req, res) {
            console.log("BackEnd Accepted: " + oPayload.to_pesal[0].C11);
          },
          error: function (error) {
            MessageBox.error("BackEnd Rejected: " + oPayload.to_pesal[0].C11 + "; " + error.responseText);
          },
        });
      },
      /* =========================================================== */
      /* Upload                                                      */
      /* =========================================================== */
      UploadFiles: function (aFiles) {
        aFiles.forEach(file => {
          this.fetchToken()
            .then(() => this.getRoutesFromBack(file))
            .then((routes) => this.processInputFile(file, routes[0]))
            .catch(error => this.sendError(error, file));
        }, this);
      },
      //turns file uploaded into blob and calls upload routines
      processInputFile: function (oInFile, oRoutes) {
        if (oInFile.size > 4000000) {
          this.uploadLargeFile({
                fileName: oInFile.fileName + "." + oInFile.fileExt,
                fileData: oInFile.fileData,
              },
              oRoutes.C2 + oRoutes.C3)
            .then(
              function (res) {
                this.submitToBack(res, oInFile, oRoutes);
                this.sendResults(res, oInFile.fileId);
              }.bind(this))
            .catch(function (error) {
              this.sendError(error, oInFile.fileId);
            }.bind(this));
        } else {
          // small files
          this.uploadToDrive(
              oInFile.fileData,
              oInFile.fileName + "." + oInFile.fileExt,
              oRoutes.C2 + oRoutes.C3)
            .then(
              function (res) {
                this.submitToBack(res, oInFile, oRoutes);
                this.sendResults(res, oInFile.fileId);
              }.bind(this))
            .catch(function (error) {
              this.sendError(error, oInFile.fileId)
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
      sendResults: function (oRes, fileId) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("driveAnswer", "fileUploaded", {
          result: oRes,
          fileId: fileId
        });
      },
      sendError: function (oRes, fileId) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("driveAnswer", "fileUploadError", {
          result: oRes,
          fileId: fileId
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
          // "/" +
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