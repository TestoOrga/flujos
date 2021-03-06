sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent",
        "bafar/flujos/flujos/model/formatter"
    ],
    function (Controller, History, UIComponent, formatter) {
        "use strict";

        return Controller.extend("bafar.flujos.flujos.controller.BaseController", {
            formatter: formatter,
            /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            get18: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**
             * Method for navigation to specific view
             * @public
             * @param {string} psTarget Parameter containing the string for the target navigation
             * @param {Object.<string, string>} pmParameters? Parameters for navigation
             * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
             */
            navTo: function (psTarget, pmParameters, pbReplace) {
                this.getRouter().navTo(psTarget, pmParameters, pbReplace);
            },

            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                var sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    this.getRouter().navTo("appHome", {}, true /*no history*/);
                }
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
              }
        });
    }
);
