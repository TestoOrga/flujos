/* global xlsx:true */
/* global filesaver:true */
sap.ui.define(
  [
    "sap/ui/base/ManagedObject",
    "bafar/flujos/flujos/libs/filesaver",
    "bafar/flujos/flujos/libs/xlsx.full.min",
  ],
  function (ManagedObject, filesaver, XlsxFullmin) {
    "use strict";

    return ManagedObject.extend("bafar.flujos.flujos.utils.XlsxUtils", {
      constructor: function (oComponent) {
        this._oComponent = oComponent;
      },
      /* ===========================================================
       Descargar Template
      ============================================================= */
      getTemplate: function (xlsxHeaders) {
        var headers = xlsxHeaders;
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
        this.onSaveAsExcel(excelBuffer, this._oComponent.flowData.actTxt + " " + this._oComponent.flowData.id);
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

      /* ===========================================================
       Cargar Template
      ============================================================= */
      readTemplate: function (inFile) {
        return new Promise((resolve, reject) => {
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
              dateNF: "DD-MMM-YYYY",
            });
            resolve(jsonObj);
          }.bind(this);
          reader.onerror = function (err) {
            reject(err);
          }.bind(this);
          reader.readAsArrayBuffer(inFile);
        })
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
    });
  }
);