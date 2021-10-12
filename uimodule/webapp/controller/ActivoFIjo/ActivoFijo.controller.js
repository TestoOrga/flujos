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
    AccountingMin,
    Fragment) {
    "use strict";

    return BaseController.extend(
      "bafar.flujos.flujos.controller.ActivoFijo.ActivoFijo", {

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
          this.initTab();
          this._tabModel = this.getModel(this.viewConfig.tabModelName);
          this._oTab = this.byId(this.viewConfig.tabControlId);
          this.xlsxHeaders = [
            "No. Activo",
            "Sub. No.",
            "CeCo Destino",
            "Precio de Venta"
          ];
          this.setModel(new JSONModel({
            in2: ""
          }), "datosGral");
          this.datosGralModel = this.getModel("datosGral");
          this.setModel(new JSONModel({
            socDestVisible: false,
            factVisible: false,
            cecoVisible: false,
            precioVentaVisible: false
          }), "viewModel");
          this.viewModel = this.getModel("viewModel");

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
        destroyIds: function () {},
        getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
          const currentHash = router.getHashChanger().getHash();
          return this.getOwnerComponent().getMode(currentHash); // since 1.75
        },
        initTab: function () {
          this.getView().setModel(new JSONModel([this.newLine()]), this.viewConfig.tabModelName);
        },
        newItemId: function () {
          this.itemId++;
          return this.itemId.toString().padStart(6, "0");
        },
        newLine: function () {
          return {
            vis1: this.newItemId(),
            in1: "",
            in2: ""
          }
        },
        onAddLine: function (oEvent) {
          console.log("Event Handler: onAddLine");
          var items = this._tabModel.getProperty("/");
          items.push(this.newLine());
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

        onInputLive: function (oEvent, param) {
          if (oEvent.getSource().getValue() !== "") {
            if (param === "NUM") this.onlyNumbers(oEvent);
            oEvent.getSource().setValueState("None");
          } else {
            oEvent.getSource().setValueState("Error");
          }
        },

        onlyNumbers: function (oEvent) {
          var _oInput = oEvent.getSource();
          var val = _oInput.getValue();
          val = val.replace(/[^\d]/g, "");
          _oInput.setValue(val);
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
              itemOwner: lineItem.getObject().in1,
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
            // this.onSelect(undefined, param, outKey)
            this.getActivoData(undefined, element);
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
          console.log("Event Handler: onHandleUploadComplete");
          var reader = new FileReader();
          reader.onload = function (e) {
            // pre-process data
            var binary = "";
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            var workbook = XLSX.read(binary, {
              type: "binary",
              cellDates: true,
              cellNF: false,
              cellText: false,
            });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonObj = XLSX.utils.sheet_to_json(worksheet, {
              raw: false,
              dateNF: "yyyymmdd",
            });
            this.setTempVals(jsonObj);
            this._oTab.setBusy(false);
          }.bind(this);
          reader.onerror = function (err) {
            this._oTab.setBusy(false);
          }.bind(this);
          reader.readAsArrayBuffer(this.templateFile);
        },
        onDownloadAsExcel: function () {
          var headers = this.xlsxHeaders;
          var data = [{}];
          for (let idx = 0; idx < headers.length; idx++) {
            data[0][headers[idx]] = "dato" + (idx + 1);
          }
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = {
            Sheets: {
              data: worksheet,
            },
            SheetNames: ["data"],
          };
          const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
          });
          console.log(excelBuffer);
          this.onSaveAsExcel(excelBuffer, this.getOwnerComponent().flowData.actTxt + " " + this.getOwnerComponent().flowData.id);
        },
        onSaveAsExcel: function (buffer, filename) {
          const EXCEL_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
          const EXCEL_EXTENSION = ".xlsx";
          const data = new Blob([buffer], {
            type: EXCEL_TYPE
          });
          saveAs(
            data,
            filename + "_export_" + new Date().getTime() + EXCEL_EXTENSION
          );
        },
        onDownTemplate: function (oEvent) {
          this.onDownloadAsExcel();
        },
        /* =========================================================== */
        /* Peticiones externas                                         */
        /* =========================================================== */
        valInputs: function () {
          var classes = this.getActiveFields();
          var valError = "";
          $(".valInput" + (classes === "" ? "" : ", " + classes)).each((i, e) => {
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
          valError = this.specificVals(valError);
          return valError;
        },

        getActiveFields: function () {
          var valCond = "";
          var activeProp = this.viewModel.getData();
          valCond = activeProp.socDestVisible ? ".valInputSocDest" : valCond;
          valCond = activeProp.factVisible ? valCond + (valCond === "" ? "" : ", ") + ".valInputFac" : valCond;
          valCond = activeProp.cecoVisible ? valCond + (valCond === "" ? "" : ", ") + ".valInputCeco" : valCond;
          valCond = activeProp.precioVentaVisible ? valCond + (valCond === "" ? "" : ", ") + ".valInputPrecioVenta" : valCond;
          return valCond;
        },

        /* =========================================================== */
        /* Especifico de Flujo                                         */
        /* =========================================================== */
        specificVals: function (val) {
          var newVal = val;
          if (this.viewModel.getData().factVisible) {
            if (this.byId("__inputRfc").getValue().length < 12) {
              newVal = "Complete RFC";
              this.byId("__inputRfc").setValueState("Error");
            }
          }
          return newVal;
        },
        onBeforeRendering: async function (approvalMode) {
          if (approvalMode || this.getOwnerComponent().currentMode === 1) {
            // sociedad y sociedad Destino
            var oPayload = {
              P1: "CAT",
              P2: "BUKRS",
              to_pesal: []
            };
            var bukrs = this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
              this.setModel(new JSONModel(res), "sociedad");
              this.setModel(new JSONModel(res), "socDest");
            });
            // tipo de movimiento
            oPayload = {
              P1: "CAT",
              P2: "MOVAF",
              to_pesal: []
            };
            var pagos = this.getOwnerComponent().getCatDataComp(oPayload, this.getModel()).then(res => {
              this.setModel(new JSONModel(res), "tpMov");
            });
            var end = await Promise.all([bukrs, pagos]);
            return end;
          }
        },
        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getActivoData(oEvent);
              break;
            case "in2":
              this.getActivoData(oEvent);
              break;
            default:
              break;
          }
        },
        getActivoData: function (oEvent, oExtControl) {
          var oControl = oExtControl ? oExtControl : oEvent.getSource();
          var datosGral = this.datosGralModel.getData();
          var lineContext = oControl.getBindingContext(this.viewConfig.tabModelName);
          var lineData = lineContext.getObject();
          if (lineData.in1 !== "" && lineData.in2 !== "") {
            var oPayload = {
              P1: "CAT",
              P2: "AF",
              P3: datosGral.in2,
              P4: lineData.in1,
              P5: lineData.in2,
              to_pesal: [],
            };
            var sPath = lineContext.sPath;
            this.getOwnerComponent().getCatDataComp(oPayload, this.getModel())
              .then((res) => {
                var activoData = res[0];
                if (activoData) {
                  lineData.vis2 = activoData.C6;
                  lineData.vis3 = activoData.C5;
                  lineData.vis4 = activoData.C22;
                  lineData.vis5 = accounting.formatMoney(activoData.C28);
                  lineData.vis5Num = activoData.C28;
                } else {
                  lineData.vis2 = "";
                  lineData.vis3 = "";
                  lineData.vis4 = "";
                  lineData.vis5 = accounting.formatMoney(0);
                  lineData.vis5Num = "";
                }
                this._tabModel.setProperty(sPath, lineData);
                console.log("activo data Loaded");
              })
          }
        },
        getFlowData: function () {
          return this._tabModel.getData();
        },
        getData: function () {
          var result = this.getFlowData();
          var gralData = this.datosGralModel.getData();
          var activeData = this.viewModel.getData();
          result.forEach(element => {
            element.gin1 = gralData.in1;
            element.gin2 = gralData.in2;
            element.gin3 = (activeData.socDestVisible ? gralData.in3 : "");
            element.gin4 = gralData.in4;
            element.gin5 = gralData.in5;
            if (activeData.factVisible) {
              element.gin6 = gralData.in6;
              element.gin7 = gralData.in7;
              element.gin8 = gralData.in8;
              element.gin9 = gralData.i9n;
              element.gin10 = gralData.in10;
            } else {
              element.gin6 = "";
              element.gin7 = "";
              element.gin8 = "";
              element.gin9 = "";
              element.gin10 = "";
            }
            element.in2 = element.in2.toString().padStart(4, "0");
            element.in3 = (activeData.cecoVisible ? element.in3 : "");
            element.in4 = (activeData.precioVentaVisible ? element.in4 : "");

            element.vis2 = element.vis2,
              element.vis3 = element.vis3,
              element.vis4 = element.vis4,
              element.vis5Num = element.vis5Num

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
        onRFCInput: function (oEvent) {
          oEvent.oSource.setValue(oEvent.oSource.getValue().toUpperCase());
        },
        onSelect: function (oEvent, param, outObj) {
          // var selKey = outKey || oEvent.oSource.getSelectedKey();
          switch (param) {
            case "tpMov":
              var tpMov = outObj.getBindingContext("tpMov").getObject() || oEvent.oSource.getSelectedItem().getBindingContext("tpMov").getObject();
              console.table({
                C3: tpMov.C3,
                C4: tpMov.C4,
                C5: tpMov.C5,
                C6: tpMov.C6
              });
              this.viewModel.setProperty("/socDestVisible", tpMov.C3 === "X" ? true : false);
              this.viewModel.setProperty("/factVisible", tpMov.C4 === "X" ? true : false);
              this.viewModel.setProperty("/cecoVisible", tpMov.C5 === "X" ? true : false);
              this.viewModel.setProperty("/precioVentaVisible", tpMov.C6 === "X" ? true : false);
              break;
            default:
              break;
          }
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
                in2: element[c[1]],
                in3: element[c[2]],
                in4: accounting.formatMoney(element[c[3]])
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
              this.byId("selectTpMov").setSelectedKey(oData.C27);
              this.onSelect(undefined, "tpMov", this.byId("selectTpMov").getSelectedItem());
              this.setGralData(oData);
              break;
            default:
              var mappedData = [];
              oData.forEach(element => {
                mappedData.push({
                  template: true,
                  vis1: element.C6,
                  in1: element.C36,
                  in2: element.C37,
                  vis2: element.C38,
                  vis3: element.C39,
                  vis4: element.C40,
                  vis5: accounting.formatMoney(element.C41),
                  vis5Num: element.C41,
                  in3: element.C42,
                  in4: accounting.formatMoney(element.C43),
                  in4Num: element.C43,
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
        setGralData: function (oData) {
          // this.byId("titleSelSociedad").setSelectedKey(oData.C28);
          var newData = this.datosGralModel.getData();
          newData.in2 = oData.C28,
            newData.in3 = oData.C29,
            newData.in4 = oData.C30,
            newData.in5 = oData.C11,
            newData.in6 = oData.C31,
            newData.in7 = oData.C32,
            newData.in8 = oData.C33,
            newData.in9 = oData.C34,
            newData.in10 = oData.C35,
            this.datosGralModel.setProperty("/", newData);
        },
        getDataForApproval: function () {
          var result = this.getFlowData();
          var mappedData = [];
          result.forEach(element => {
            mappedData.push({
              C6: element.vis1,
              C36: element.in1,
              C37: element.in2,
              C38: element.vis2,
              C39: element.vis3,
              C40: element.vis4,
              C41: element.vis5Num,
              C42: element.in3,
              C43: element.in4Num,
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
            this.displayMotivePopOver(lineCxt.getObject().vis1);
          } else {
            this._tabModel.setProperty(lineCxt.sPath + "/rejectText", "");
            this.getModel("fragMotive").setProperty("/", "");
          }
        },
        displayMotivePopOver: function (itemId) {
          var oView = this.getView();
          if (!this.byId("motiveDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "bafar.flujos.flujos.view.fragments.viewMotivePopUp",
              controller: this,
            }).then(
              function (oDialog) {
                // connect dialog to the root view of this component (models, lifecycle)
                oView.addDependent(oDialog);
                oView.byId("motiveDialog").setTitle("Item No: " + itemId);
                console.log("Frag Loaded");
                oDialog.open();
              }.bind(this)
            );
          } else {
            oView.byId("motiveDialog").setTitle("Item No: " + itemId);
            oView.byId("motiveDialog").open();
          }
        },
        acceptRejectComment: function (oEvent) {
          var line = this.getModel("fragMotive").getData();
          this._tabModel.setProperty(line.line.sPath + "/rejectText", line.rejectText);
          this.byId("motiveDialog").close();
        },

        _showMotivo: function (oEvent) {
          var lineCxt = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          this.setModel(new JSONModel({
            line: lineCxt,
            tabLine: oEvent.getSource().getParent().getParent(),
            rejectText: lineCxt.getObject().rejectText
          }), "fragMotive");
          this.displayMotivePopOver(lineCxt.getObject().vis1);
        },
        afterRejectClose: function (oEvent) {
          if (this.getModel("fragMotive").getData().rejectText === "") {
            this.getModel("fragMotive").getData().tabLine.getAggregation("cells").find(x => x.sId.includes("switchito")).getAggregation("items").find(x => x.sId.includes("switchito")).setState(true);
          }
        }
      }
    );
  }
);