sap.ui.define([
  "sap/ui/base/ManagedObject",
  "sap/ui/core/Fragment"
], function (
  ManagedObject,
  Fragment
) {
  "use strict";

  return ManagedObject.extend("bafar.flujos.flujos.utils.MotivoFrag", {
    constructor: function () {
      // this._oView = oView;
    },
    open: function (title, oCallController) {
      var oView = oCallController.getView();
      console.log("Frag Motivo Loading...");
      if (!oView.byId("motiveDialog")) {
        var oFragmentController = {
          acceptRejectComment: function () {
            var line = oCallController.getModel("fragMotive").getData();
            oCallController._tabModel.setProperty(line.line.sPath + "/rejectText", line.rejectText);
            oFragmentController.onCloseDialog();            
          },
          afterRejectClose: function () {
            if (oCallController.getModel("fragMotive").getData().rejectText === "") {
              oCallController.getModel("fragMotive").getData().tabLine.getAggregation("cells").find(x => x.sId.includes("switchito")).getAggregation("items").find(x => x.sId.includes("switchito")).setState(true);
            }
          },
          onCloseDialog: function () {
            oView.byId("motiveDialog").close();
          },
          afterOpen: function () {
            // oView.byId("motiveDialog").setState("Error");
          }
        };
        Fragment.load({
          id: oView.getId(),
          name: "bafar.flujos.flujos.view.fragments.viewMotivePopUp",
          controller: oFragmentController,
        }).then(
          function (oDialog) {
            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog);
            oView.byId("motiveDialog").setTitle("Item No: " + title);
            console.log("Frag Motivo Loaded");
            oDialog.open();
          }.bind(this)
        );
      } else {
        oView.byId("motiveDialog").setTitle("Item No: " + title);
        oView.byId("motiveDialog").open();
      }
    }
  });
});