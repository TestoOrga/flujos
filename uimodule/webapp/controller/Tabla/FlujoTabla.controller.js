sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
  ],
  function (Controller,
    JSONModel,
    MessageToast) {
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
          }, {
            C1: "000001",
            C2: "GUZMAN AUGUSTO",
            C3: "B2",
            C4: this.formatDate(Date.now()),
            C5: "Compensacion",
            C6: this.formatDate(Date.now()),
            C7: this.formatDate(Date.now()),
          }];
          this.getView().setModel(new JSONModel(testModel), "tablaFlujo");
          console.log('finInit');
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
            return s[0] + " " + s[1] + " " + s[2];
          }
        },

        onInputChange: function (oEvent) {
          this.addpopover(oEvent.getSource().getParent().getAggregation("cells").find(x => x.sId.includes("colList")));
          oEvent.getSource().getParent().removeStyleClass("lineItemSucc");
          oEvent.getSource().getParent().setHighlight("Error");
          oEvent.getSource().getParent().addStyleClass("lineItemError");
          console.log();
        },
        addpopover: function (oControl) {
          this._popoverDelegate = {
            onmouseover: function (oEvent) {
              // MessageToast.show("sadgfhsdfkgj");
              this.attachPopoverOnMouseover(oEvent.srcControl, this.byId("popover"));
            }
          };
          oControl.addEventDelegate(this._popoverDelegate, this);
        },
        attachPopoverOnMouseover: function (targetControl, popover) {
          targetControl.addEventDelegate({
            onmouseover: this._showPopover.bind(this, targetControl, popover),
            onmouseout: this._clearPopover.bind(this, popover),
          }, this);
        },
        _showPopover: function (targetControl, popover) {
          // var oCarpeta = this.getView().getModel("detailModel").getProperty(targetControl.getBindingContext("detailModel").sPath);
          // this.byId("infoPopUpText").setText(oCarpeta.Ayuda);
          var testo = "asdfasdfasdf";
          this.byId("infoPopUpText").setText(testo);
          this.byId("popover").setTitle(testo);
          this._timeId = setTimeout(() => popover.openBy(targetControl), 500);
        },
        _clearPopover: function (popover) {
          clearTimeout(this._timeId) || popover.close();
        },

        onAddLine: function (oEvent) {

        },

        onItemPress: function (oEvent) {
          // this._showPopover(oEvent.getSource(), this.byId("popover"));
        }
      }
    );
  }
);