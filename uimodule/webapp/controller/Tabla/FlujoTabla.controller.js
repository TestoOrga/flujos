sap.ui.define(
  ["bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
  ],
  function (BaseController,
    JSONModel,
    MessageToast) {
    "use strict";

    return BaseController.extend(
      "bafar.flujos.flujos.controller.Tabla.FlujoTabla", {
        /**
         * @override
         */
        onInit: function () {
          // var testModel = [{
          //   C1: "000001",
          //   C2: "GUZMAN AUGUSTO",
          //   C3: "B2",
          //   C4: this.formatDate(Date.now()),
          //   C5: "Compensacion",
          //   C6: this.formatDate(Date.now()),
          //   C7: this.formatDate(Date.now()),
          // }, {
          //   C1: "000001",
          //   C2: "GUZMAN AUGUSTO",
          //   C3: "B2",
          //   C4: this.formatDate(Date.now()),
          //   C5: "Compensacion",
          //   C6: this.formatDate(Date.now()),
          //   C7: this.formatDate(Date.now()),
          // }];
          // this.getView().setModel(new JSONModel(testModel), "tablaFlujo");
          this.initTab();
          console.log('finInit');
        },
        initTab: function () {
          this.getView().setModel(new JSONModel([{}]), "tablaFlujo");
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

        onInputChange: function (oEvent, param) {
          switch (param) {
            case "in1":
              this.getPernr(oEvent);
              break;

            default:
              break;
          }
          this.addpopover(oEvent.getSource().getParent().getAggregation("cells").find(x => x.sId.includes("colList")));
          oEvent.getSource().getParent().removeStyleClass("lineItemSucc");
          oEvent.getSource().getParent().setHighlight("Error");
          oEvent.getSource().getParent().addStyleClass("lineItemError");
          console.log();
        },

        getPernr: function (oEvent) {
          var oEntityData = {
            P1: "CAT",
            P2: "PERNR",
            P3: oEvent.getParameter("value"),
            to_pesal: [],
          };
          var lineContext = oEvent.getSource().getBindingContext("tablaFlujo");
          var sPath = lineContext.sPath;
          var lineData = lineContext.getObject();
          this.getCatData(oEntityData).then((res) => {
            var pernrData = res[0];
            lineData.vis2 = pernrData.C2;
            this.getModel("tablaFlujo").setProperty(sPath, lineData);
            console.log("departamentoLoaded");
          });
        },
        getCatData: function (oPayload) {
          return new Promise((resolve, reject) => {
            this.getModel().create("/BaseSet", oPayload, {
              async: true,
              success: function (req, res) {
                resolve(res.data.to_pesal.results);
              },
              error: function (error) {
                reject(error);
              }
            });
          })
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
          //agrego una linea vacía para poder cargar un material
          this.byId("mainTable").removeSelections(true)
          var materiales = this.getView().getModel("tablaFlujo").getProperty("/");
          materiales.push({});
          this.getView().getModel("tablaFlujo").setProperty("/", materiales);
        },

        onItemPress: function (oEvent) {
          // this._showPopover(oEvent.getSource(), this.byId("popover"));
        },
        valInputs: function () {
          var valError;
          $(".valInput").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            if (oControl.getValue() === "") {
              oControl.setValueState("Error");
              valError = this.get18().getText("flujoTabla.camposVaceos");
            }
          });
          return valError;
        },

        validar: function (oEvent) {
          this.valInputs();
        },

        onRemoveLine: function (oEvent) {
          var tabItems = this.getView().getModel("tablaFlujo").getData();
          var selItems = this.byId("mainTable").getSelectedItems();
          selItems.forEach(element => {
            var i = parseInt(element.getBindingContextPath("tablaFlujo").slice(1));
            tabItems.splice(i, 1);
          }, this);
          this.getModel("tablaFlujo").setData(tabItems);
        },

        mainTabSelect: function (oEvent) {
          if (oEvent.getSource().getSelectedItems().length > 0) {
            this.byId("toolbarDel").setEnabled(true);
          } else {
            this.byId("toolbarDel").setEnabled(false);

          }
        },
      }
    );
  }
);