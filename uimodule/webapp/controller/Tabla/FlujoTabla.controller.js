sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend(
      "bafar.flujos.flujos.controller.Tabla.FlujoTabla", {
        /**
         * @override
         */
        onInit: function () {
          var testModel = [{
            C1: "000001",
            C2: "GUZMAN AUGUSTO",
            C3: "B2",
            C4: this.formatDate(Date.now()),
            C5: "Compensacion",
            C6: this.formatDate(Date.now()),
            C7: this.formatDate(Date.now()),
          }, ];
          this.getView().setModel(new JSONModel(testModel), "tablaFlujo");
        },
        formatDate: function (oDate) {
            if (oDate) {
              function parse(t, a) {
                function format(m) {
                  let f = new Intl.DateTimeFormat("en", m);
                  return f.format(t).padStart(2, "0");
                }
                return a.map(format);
              }
              var a = [{
                  year: "numeric"
                },
                {
                  month: "short"
                },
                {
                  day: "numeric"
                },
              ];
              let s = parse(oDate, a);
              return s[0] + " " +  s[1] + " " + s[2];
            }
          },
      }
    );
  }
);