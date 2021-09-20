sap.ui.define(
  ["sap/ui/base/ManagedObject", "sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel"],
  function (ManagedObject, MessageBox, Fragment, JSONModel) {
    "use strict";

    return ManagedObject.extend("bafar.flujos.flujos.utils.ErrorFrag", {
      constructor: function (oView) {
        this._oView = oView;
      },
      exit: function () {
        delete this._oView;
      },
      open: function (config, data, title) {
        var oView = this._oView;
        oView.setModel(new JSONModel(config), "fragRes");
        oView.setModel(new JSONModel(data), "fragResData");
        console.log("Frag Loading...");
        if (!oView.byId("resDialog")) {
          var oFragmentController = {
            onCloseDialog: function () {
              oView.byId("resDialog").close();
            },
            afterOpen: function () {
              // oView.byId("resDialog").setTitle(title ? title : "pedidoData.Vbeln");
              oView.byId("resDialog").setState("Error");
            }
          };

          Fragment.load({
            id: oView.getId(),
            name: "bafar.flujos.flujos.view.fragments.flowCreationError",
            controller: oFragmentController,
          }).then(
            function (oDialog) {
              // connect dialog to the root view of this component (models, lifecycle)
              oView.addDependent(oDialog);
              oView.byId("resDialog").setTitle(title ? title : "pedidoData.Vbeln");
              console.log("Frag Loaded");
              oDialog.open();
            }.bind(this)
          );
        } else {
          oView.byId("resDialog").setTitle(title ? title : "pedidoData.Vbeln");
          oView.byId("resDialog").open();
        }
      }
    });
  }
);