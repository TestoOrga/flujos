/* global xlsx:true */
/* global filesaver:true */
/* global accounting:true */
sap.ui.define(
  ["bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bafar/flujos/flujos/libs/filesaver",
    "bafar/flujos/flujos/libs/xlsx.full.min",
    "bafar/flujos/flujos/libs/accounting.min",
    "sap/ui/core/Fragment"
  ],
  function (BaseController,
    JSONModel,
    filesaver,
    XlsxFullmin,
    min,
    Fragment) {
    "use strict";

    return BaseController.extend(
      "bafar.flujos.flujos.controller.CambioSueldo.CambioSueldo", {

        /**
         * @override
         */
        onInit: function () {
          // Modo Aprobacion          
          if (this.getOwnerComponent().currentMode === 3 || this.getCurrentRouteName() === 3) {
            this.getView().setModel(new JSONModel({
              noEditField: false,
              creation: false,
              enabled: false
            }), "afterCreation");
          } else {
            this.getView().setModel(new JSONModel({
              noEditField: true,
              creation: true
            }), "afterCreation");
          };
          window.console.log("entra");
          this.loadedFiles = [];
          this.fileId = 0;
          this.itemId = 0;
          this.viewConfig = {
            tabModelName: "tablaFlujo",
            tabControlId: "mainTable",
          };
          this.headerData = {
            sociedad: "",
            division: "",
            areaNomina: ""
          };
          this.setModel(new JSONModel({
            release: false
          }), "viewGeneral");
          this.initTab();
          this._tabModel = this.getModel(this.viewConfig.tabModelName);
          this._oTab = this.byId(this.viewConfig.tabControlId);
          this._tabModel.attachPropertyChange(function (oEvent, a, s, d) {
            console.log("")
          }, this);
          this.xlsxHeaders = [
            "No. Personal",
            "Sueldo",
            "Fecha",
            "Motivo",
            "Justificación"
          ];

          console.log("finInit");

          this.oEventBus = this.getOwnerComponent().getEventBus();
          this.oEventBus.subscribe("flowRequest", "valFlow", this.getValInputs, this);
          this.oEventBus.subscribe("flowRequest", "flowData", this.getData, this);
          this.oEventBus.subscribe("flowResult", "dataError", this.showErrorTable, this);
          this.oEventBus.subscribe("flowCreated", "releaseFiles", this.releaseFiles, this);
          this.oEventBus.subscribe("flowCreated", "finalFiles", this.finalFiles, this);
          this.oEventBus.subscribe("flowCreated", "releaseFilesEnded", this.releaseFilesEnded, this);

          // Aprobacion
          this.oEventBus.subscribe("flowApproval", "loadFlowData", this.applyData, this);
          this.oEventBus.subscribe("flowApproval", "editMode", this.editMode, this);
          this.oEventBus.subscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
        },
        onExit: function () {

          this.oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
          this.oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
          this.oEventBus.unsubscribe("flowResult", "dataError", this.showErrorTable, this);
          this.oEventBus.unsubscribe("flowCreated", "releaseFiles", this.releaseFiles, this);
          this.oEventBus.unsubscribe("flowCreated", "finalFiles", this.finalFiles, this);
          this.oEventBus.unsubscribe("flowCreated", "releaseFilesEnded", this.releaseFilesEnded, this);
          // Aprobacion
          this.oEventBus.unsubscribe("flowApproval", "loadFlowData", this.applyData, this);
          this.oEventBus.unsubscribe("flowApproval", "editMode", this.editMode, this);
          this.oEventBus.unsubscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
          this.destroyIds();
        },

        //destruir ids que causan conflicto duplicatedID
        destroyIds: function () {
          this.byId("attachPopover").destroy();
          this.byId("popover").destroy();
        },
        getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
          const currentHash = router.getHashChanger().getHash();
          return this.getOwnerComponent().getMode(currentHash); // since 1.75
        },
        initTab: function () {
          this.getView().setModel(new JSONModel([{
            vis1: this.newItemId()
          }]), this.viewConfig.tabModelName);
        },
        newItemId: function () {
          this.itemId++;
          return this.itemId.toString().padStart(6, "0");
        },
        loadPopOver: function (oControl) {
          this.addpopover(oControl);
        },
        addpopover: function (oControl) {
          this._popoverDelegate = {
            onmouseover: function (oEvent) {
              this._showPopover(oEvent.srcControl, this.byId("popover"));
            },
            onmouseout: function (oEvent) {
              this._clearPopover(this.byId("popover"))
            }
          };
          oControl.addEventDelegate(this._popoverDelegate, this);
        },
        _showPopover: function (targetControl, popover) {
          var lineData = this.getModel("tablaFlujo").getProperty(targetControl.getBindingContext("tablaFlujo").sPath);
          this.byId("popover").setModel(new JSONModel(lineData.popUp), "popLine");
          this.byId("popover").setTitle(lineData.popUp.vis1);
          this._timeId = setTimeout(() => popover.openBy(targetControl), 500);
        },
        _clearPopover: function (popover) {
          clearTimeout(this._timeId) || popover.close();
        },

        onAddLine: function (oEvent) {
          console.log("Event Handler: onAddLine");
          var items = this._tabModel.getProperty("/");
          items.push({
            vis1: this.newItemId()
          });
          this._tabModel.setProperty("/", items);
        },
        onRemoveLines: function (oEvent) {
          var itemTab = this._oTab.getItems();
          this._oTab.getSelectedItems().forEach(element => {
            this.oEventBus.publish("flowReq", "delItem", {
              itemId: element.getBindingContext(this.viewConfig.tabModelName).getObject().vis1
            });
          }, this);
          var newTab = itemTab.filter(element => {
            return !element.getProperty("selected");
          }).map(element => {
            return element.getBindingContext(this.viewConfig.tabModelName).getObject();
          });
          this._tabModel.setData(newTab);
          this._oTab.removeSelections(true);
        },

        mainTabSelect: function (oEvent) {
          if (oEvent.getSource().getSelectedItems().length > 0) {
            this.byId("toolbarDel").setEnabled(true);
          } else {
            this.byId("toolbarDel").setEnabled(false);

          }
        },

        onInputLive: function (oEvent) {
          if (oEvent.getSource().getValue() !== "") {
            oEvent.getSource().setValueState("None");
          } else {
            oEvent.getSource().setValueState("Error");
          }
        },

        onHandleUploadComplete: function (oEvent) {
          console.log("Event Handler: onHandleUploadComplete");
          var oFileUploader = oEvent.oSource;
          var inFile = oFileUploader.getFocusDomRef().files[0];
          var lineItem = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          var reader = new FileReader();
          reader.onload = function (readerEvt) {

            console.log("processFile");
            var byteCharacters = atob(readerEvt.target.result.split(",")[1]);
            // Each character's code point (charCode) will be the value of the byte. We can create an array of byte values by applying this using the .charCodeAt method for each character in the string.
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
              type: inFile.type,
            });
            var name = inFile.name.substr(0, inFile.name.lastIndexOf("."));
            var ext = inFile.name.substr(inFile.name.lastIndexOf(".") + 1);

            this._tabModel.setProperty(lineItem.sPath + "/atta", false);
            this.fileId++;
            this.loadedFiles.push({
              itemId: lineItem.getObject().vis1,
              fileId: this.fileId,
              fileName: name,
              fileExt: ext,
              oFile: inFile,
              fileData: fileData,
              size: readerEvt.total
            });
            this.oEventBus.publish("flowRes", "filesLoaded", {
              itemId: lineItem.getObject().vis1,
              itemOwner: lineItem.getObject().vis2,
              fileId: this.fileId,
              fileName: name,
              fileExt: ext
            });
          }.bind(this);
          reader.onerror = function (err) {
            this._tabModel.setProperty(sPath + "/atta", false);
          }.bind(this);
          reader.readAsDataURL(inFile);
        },

        onHandleUploadStart: function (oEvent) {
          this._tabModel.setProperty(oEvent.getSource().getBindingContext("tablaFlujo").sPath + "/atta", true);
        },

        onTableUpdateFinished: function (oEvent) {
          this._oTab.getItems().filter(element => {
            return element.getBindingContext("tablaFlujo").getObject().template
          }).forEach(element => {
            this._tabModel.setProperty(element.getBindingContext("tablaFlujo").sPath + "/template", false);
            this.getPernr(undefined, element);
          });
          if (this._oTab.getSelectedItems().length === 0) {
            this.byId("toolbarDel").setEnabled(false);
          };
          this.byId("listTitle").setText(this.get18().getText("totalPosiciones", [this._oTab.getItems().length]));
        },
        showErrorTable: function (sChannel, oEvent, res) {
          var fragRes = {
            "col1": true,
            "col2": true,
            "col3": true
          };
          this.getOwnerComponent().openErrorFrag(fragRes, res.res.to_pesal.results, this.getOwnerComponent().flowData.id + ": " + res.res.PeMsj);
        },
        releaseFiles: function () {
          this.oEventBus.publish("flowCreated", "fileReleaseStart");
        },
        finalFiles: function (sChannel, oEvent, res) {
          var uploadFiles = this.loadedFiles.filter(loaded => {
            var testo = res.filesTab.find(final => {
              return final.fileId === loaded.fileId
            });
            return testo;
          });
          this.getOwnerComponent().oOneDrive.UploadFiles(uploadFiles);
        },
        releaseFilesEnded: function () {
          this.oEventBus.publish("flowCreated", "EndFlow");
        },
        /* =========================================================== */
        /* EXCEL                                                       */
        /* =========================================================== */
        onHandleTempUploadStart: function (oEvent) {
          if (oEvent.getParameter("newValue") !== "") {
            this.templateFile = oEvent.getParameter("files")[0];
            console.log("Event Handler: onHandleUploadStart");
            this._oTab.setBusy(true);
          }
        },
        handleTempUploadCompleted: function (oEvent) {
          this.getOwnerComponent().oXlsxUtils.readTemplate(this.templateFile).then(
            (jsonObj) => {
              this.setTempVals(jsonObj);
              this._oTab.setBusy(false);
            }).
          catch((error) => {
            this._oTab.setBusy(false);
            MessageBox.error(error.responseText || error.message);
          });
          //VERIFICAR NO AFECTACION desde 12/October/2021
          // console.log("Event Handler: onHandleUploadComplete");
          // var reader = new FileReader();
          // reader.onload = function (e) {
          //   // pre-process data
          //   var binary = "";
          //   var bytes = new Uint8Array(e.target.result);
          //   var length = bytes.byteLength;
          //   for (var i = 0; i < length; i++) {
          //     binary += String.fromCharCode(bytes[i]);
          //   }
          //   var workbook = XLSX.read(binary, {
          //     type: "binary",
          //     cellDates: true,
          //     cellNF: false,
          //     cellText: false,
          //   });
          //   var worksheet = workbook.Sheets[workbook.SheetNames[0]];
          //   var jsonObj = XLSX.utils.sheet_to_json(worksheet, {
          //     raw: false,
          //     dateNF: "yyyymmdd",
          //   });
          //   this.setTempVals(jsonObj);
          //   this._oTab.setBusy(false);
          // }.bind(this);
          // reader.onerror = function (err) {
          //   this._oTab.setBusy(false);
          // }.bind(this);
          // reader.readAsArrayBuffer(this.templateFile);
        },
        // onDownloadAsExcel: function () {
        //   var headers = this.xlsxHeaders;
        //   var data = [{}];
        //   for (let idx = 0; idx < headers.length; idx++) {
        //     data[0][headers[idx]] = "dato" + (idx + 1);
        //   }
        //   const worksheet = XLSX.utils.json_to_sheet(data);
        //   const workbook = {
        //     Sheets: {
        //       data: worksheet,
        //     },
        //     SheetNames: ["data"],
        //   };
        //   const excelBuffer = XLSX.write(workbook, {
        //     bookType: "xlsx",
        //     type: "array",
        //   });
        //   console.log(excelBuffer);
        //   this.onSaveAsExcel(excelBuffer, this.getOwnerComponent().flowData.actTxt + " " + this.getOwnerComponent().flowData.id);
        // },
        // onSaveAsExcel: function (buffer, filename) {
        //   const EXCEL_TYPE =
        //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        //   const EXCEL_EXTENSION = ".xlsx";
        //   const data = new Blob([buffer], {
        //     type: EXCEL_TYPE
        //   });
        //   saveAs(
        //     data,
        //     filename + "_export_" + new Date().getTime() + EXCEL_EXTENSION
        //   );
        // },
        onDownTemplate: function (oEvent) {
          //VERIFICAR NO AFECTACION desde 12/October/2021 this.onDownloadAsExcel();
          this.getOwnerComponent().oXlsxUtils.getTemplate(this.xlsxHeaders);
        },
        /* =========================================================== */
        /* Peticiones externas                                         */
        /* =========================================================== */
        valInputs: function () {
          var valError = "";
          $(".valInput").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            try {
              var value = oControl.getValue();
            } catch (error) {
              var value = oControl.getSelectedKey();
            }
            if (value === "") {
              oControl.setValueState("Error");
              valError = this.get18().getText("flujoTabla.camposVaceos");
            } else {
              oControl.setValueState("None");
            }
          });
          return valError;
        },

        /* =========================================================== */
        /* Especifico de Flujo                                         */
        /* =========================================================== */
        onBeforeRendering: async function (approvalMode) {
          if (approvalMode || this.getOwnerComponent().currentMode === 1) {
            var oPayload = {
              P1: "CAT",
              P2: "BUKRS",
              to_pesal: []
            };
            var bukrs = this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
              this.setModel(new JSONModel(res), "sociedad");
            });
            oPayload = {
              P1: "CAT",
              P2: "ABKRS",
              to_pesal: []
            };
            var pagos = this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
              this.setModel(new JSONModel(res), "areaNomina");
            });
            var end = await Promise.all([bukrs, pagos]);
            return end;
          }
        },
        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getPernr(oEvent);
              break;
            default:
              break;
          }
        },
        getPernr: function (oEvent, oExtControl) {
          var oControl = oExtControl ? oExtControl : oEvent.getSource();
          var oPayload = {
            P1: "CAT",
            P2: "PERNR",
            P3: oEvent ? oEvent.getParameter("value") : oControl.getBindingContext("tablaFlujo").getObject().in1,
            to_pesal: [],
          };
          var lineContext = oControl.getBindingContext(this.viewConfig.tabModelName);
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          var controlForPopover = (oEvent ? oControl.getParent().getAggregation("cells") : oControl.getAggregation("cells")).find(x => x.sId.includes("attachPopover"));
          this.getOwnerComponent().getCatDataComp(oPayload, this.getModel())
            .then((res) => {
              var pernrData = res[0];
              if (pernrData) {
                lineData.vis2 = pernrData.C2;
                lineData.vis3 = pernrData.C26;
                lineData.vis4 = pernrData.C27;
                lineData.vis5 = pernrData.C28;
                lineData.popUp = {
                  visP1: pernrData.C15,
                  visP2: pernrData.C13,
                  visP3: pernrData.C19,
                  visP4: pernrData.C22,
                  visP5: pernrData.C18,
                  visP6: pernrData.C15
                };
              } else {
                lineData.vis2 = "";
                lineData.vis3 = "";
                lineData.vis4 = "";
                lineData.popUp = {};
              }
              this._tabModel.setProperty(sPath, lineData);
              console.log("PERNR Loaded");
              this.loadPopOver(controlForPopover);
            })
        },
        getFlowData: function () {
          return this._tabModel.getData();
        },
        getData: function () {
          var result = this.getFlowData();
          result.forEach(element => {
            element.head1 = this.headerData.sociedad;
            element.head2 = this.headerData.division;
            element.head3 = this.headerData.areaNomina;
          })
          this.oEventBus.publish("flowResults", "flowData", {
            res: result,
            typeArr: true
          });
        },

        getValInputs: function () {
          var errorMsg = this.valInputs();
          if (errorMsg !== "") {
            this.oEventBus.publish("flowResults", "flowValid", {
              res: false
            });
          } else {
            this.oEventBus.publish("flowResults", "flowValid", {
              res: true
            });
          }
        },
        onSelect: function (oEvent, param, outKey) {
          const afterSelect = () => {
            if (this.headerData.sociedad !== "" &&
              this.headerData.division !== "" &&
              this.headerData.areaNomina !== "") {
              this.getModel("viewGeneral").setProperty("/release", true);
            } else {
              this.getModel("viewGeneral").setProperty("/release", false);
            }
          };
          var selKey = outKey || oEvent.oSource.getSelectedKey();
          switch (param) {
            case "sociedad":
              this.headerData.sociedad = selKey;
              var oPayload = {
                P1: "CAT",
                P2: "WERKS",
                P3: selKey,
                to_pesal: []
              };
              return this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
                if (this.getModel("division")) {
                  this.getModel("division").setProperty("/", []);
                }
                if (res.length > 0) {
                  this.setModel(new JSONModel(res), "division");
                  this.byId("titleSelDivision").setEnabled(outKey ? false : true);
                  this.headerData.division = this.byId("titleSelDivision").getSelectedKey();
                } else {
                  this.headerData.division = "";
                }
                afterSelect();
              });
              // break;
            case "division":
              this.headerData.division = selKey;
              break;
            case "areaNomina":
              this.headerData.areaNomina = selKey;
              afterSelect();
              return this.getMotivo(oEvent);
              // break;
            default:
              break;
          }
          afterSelect();
        },
        getMotivo: function (oEvent) {
          var oPayload = {
            P1: "CAT",
            P2: "MOTSDO",
            to_pesal: []
          };
          return this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then((res) => {
            if (this.getModel("in4")) {
              this.getModel("in4").setProperty("/", []);
            }
            if (res.length > 0) {
              this.setModel(new JSONModel(res), "in4");
            }
            // this.resetCC();
          });
        },
        formatCurrency: function (oEvent, param) {
          var currencyT = oEvent.oSource.getValue();
          var currency = isNaN(Number(currencyT)) ? 0 : currencyT;
          var currencyFormated = accounting.formatMoney(currency);
          var lineContext = oEvent.getSource().getBindingContext(this.viewConfig.tabModelName);
          var lineData = lineContext.getObject();
          if (oEvent) {
            lineData[param] = currencyFormated;
            lineData[param + "Num"] = currency;
            this._tabModel.setProperty(sPath, lineData);
          }
        },
        setTempVals: function (oTab) {
          var c = this.xlsxHeaders;
          if (oTab.length > 0) {
            var tabDataZero = this._tabModel.getProperty("/");
            var tabData = tabDataZero.filter(element => {
              return element.in1 ? element.in1 !== "" : false;
            });
            if (tabData.length === 0) {
              this.itemId = 0;
            }
            oTab.forEach(element => {
              tabData.push({
                template: true,
                vis1: this.newItemId(),
                in1: element[c[0]],
                in2: accounting.formatMoney(element[c[1]]),
                in3: element[c[2]],
                in4: element[c[3]].toString().padStart(3, "0"),
                in5: element[c[4]]
              });
            });
            this._tabModel.setProperty("/", tabData);
            this._oTab.removeSelections(true);
            this._tabModel.refresh(true);
          }
        },


        // APROBACION
        applyData: function (sChannel, oEvent, res) {
          this.onBeforeRendering(true)
            .then(() => this.mapToView("HEADER", res.res[0]))
            .then(() =>
              this.mapToView("ITEMS", res.res))
            .then(() => {
              this.oEventBus.publish("flowApproval", "endDataApplied");
            })
            .catch(() => {
              this.oEventBus.subscribe("flowApproval", "endDataApplied");
            });

        },

        mapToView: function (block, oData) {
          switch (block) {
            case "HEADER":
              this.byId("titleSelSociedad").setSelectedKey(oData.C27);
              return new Promise((resolve, reject) => {
                this.onSelect(undefined, "sociedad", oData.C27)
                  .then(() => {
                    this.onSelect(undefined, "areaNomina", oData.C29).then((res) => {
                      this.byId("titleSelDivision").setSelectedKey(oData.C28)
                      this.byId("titleSelAreaNomina").setSelectedKey(oData.C29)
                      resolve(oData.C29);
                    });
                  });
              })

              // break;
            default:
              var mappedData = [];
              oData.forEach(element => {
                mappedData.push({
                  template: true,
                  vis1: element.C6,
                  in1: element.C30,
                  vis2: element.C31,
                  in2: accounting.formatMoney(element.C32),
                  in2Num: element.C32,
                  in3: element.C33,
                  in4: element.C34,
                  in5: element.C11,
                  vis3: element.C36,
                  vis4: element.C37,
                  vis5: element.C38,
                  rejectText: ""
                });
              });
              this._tabModel.setProperty("/", mappedData);
              this._oTab.removeSelections(true);
              this._tabModel.refresh(true);
              // break;
          }
          // }
        },
        getDataForApproval: function () {
          var result = this.getFlowData();
          var mappedData = [];
          result.forEach(element => {
            mappedData.push({
              C6: element.vis1,
              C30: element.in1,
              C31: element.vis2,
              C32: element.in2Num,
              C33: element.in3,
              C34: element.in4,
              C11: element.in5,
              C36: element.vis3,
              C37: element.vis4,
              C38: element.vis5,
              C16: element.rejectText === "" ? "X" : "",
              C20: element.rejectText,
            });
          });
          this.oEventBus.publish("flowResults", "flowData", {
            res: mappedData,
            typeArr: true
          });
        },

        editMode: function (sChannel, oEvent, res) {
          this.getView().getModel("afterCreation").setProperty("/enabled", res.edit);
        },

        switchChanged: function (oEvent) {
          var lineCxt = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          if (!oEvent.oSource.getState()) {
            this.setModel(new JSONModel({
              tabLine: oEvent.getSource().getParent().getParent(),
              line: lineCxt,
              rejectText: ""
            }), "fragMotive");
            //VERIFICAR NO AFECTACION desde 12/October/2021
            // this.displayMotivePopOver(lineCxt.getObject().vis1);
            this.getOwnerComponent().openMotivoFrag(lineCxt.getObject().vis1, this);
          } else {
            this._tabModel.setProperty(lineCxt.sPath + "/rejectText", "");
            this.getModel("fragMotive").setProperty("/", "");
          }
        },
        //VERIFICAR NO AFECTACION desde 12/October/2021
        // displayMotivePopOver: function (itemId) {
        //   var oView = this.getView();
        //   if (!this.byId("motiveDialog")) {
        //     Fragment.load({
        //       id: oView.getId(),
        //       name: "bafar.flujos.flujos.view.fragments.viewMotivePopUp",
        //       controller: this,
        //     }).then(
        //       function (oDialog) {
        //         // connect dialog to the root view of this component (models, lifecycle)
        //         oView.addDependent(oDialog);
        //         oView.byId("motiveDialog").setTitle("Item No: " + itemId);
        //         console.log("Frag Loaded");
        //         oDialog.open();
        //       }.bind(this)
        //     );
        //   } else {
        //     oView.byId("motiveDialog").setTitle("Item No: " + itemId);
        //     oView.byId("motiveDialog").open();
        //   }
        // },
        // acceptRejectComment: function (oEvent) {
        //   var line = this.getModel("fragMotive").getData();
        //   this._tabModel.setProperty(line.line.sPath + "/rejectText", line.rejectText);
        //   this.byId("motiveDialog").close();
        // },

        _showMotivo: function (oEvent) {
          var lineCxt = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          this.setModel(new JSONModel({
            line: lineCxt,
            tabLine: oEvent.getSource().getParent().getParent(),
            rejectText: lineCxt.getObject().rejectText
          }), "fragMotive");
          //VERIFICAR NO AFECTACION desde 12/October/2021
          // this.displayMotivePopOver(lineCxt.getObject().vis1);
          this.getOwnerComponent().openMotivoFrag(lineCxt.getObject().vis1, this);
        },

        //VERIFICAR NO AFECTACION desde 12/October/2021
        // afterRejectClose: function (oEvent) {
        //   if (this.getModel("fragMotive").getData().rejectText === "") {
        //     this.getModel("fragMotive").getData().tabLine.getAggregation("cells").find(x => x.sId.includes("switchito")).getAggregation("items").find(x => x.sId.includes("switchito")).setState(true);
        //   }
        // }
      }
    );
  }
);