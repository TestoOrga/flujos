sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter"
  ],
  function (BaseController,
    JSONModel,
    MessageBox,
    Filter,
    FilterOperator,
    Fragment,
    Sorter) {
    "use strict";

    return BaseController.extend("bafar.flujos.flujos.controller.Aprobacion", {
      /**
       * @override
       */
      onInit: function () {
        //   Controller.prototype.onInit.apply(this, arguments);
        // this.getOwnerComponent().getCatDataComp(oPayload, oModel)
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteApprovalView").attachPatternMatched((oEvent) => {
          this.getListData();
        }, this);
        this._oList = this.byId("list");
        this._oGroupFunctions = {
          C6: function (oContext) {
            return {
              text: this.get18().getText(
                "AprobacionController.AgrupadoPor",
                this.get18().getText("ViewSettingsDialogFragment.NoDeFlujo")
              ),
            };
          }.bind(this),
          block: function (oContext) {
            return {
              text: this.get18().getText(
                "AprobacionController.AgrupadoPor",
                this.get18().getText("ViewSettingsDialogFragment.Departamento")
              ),
            };
          }.bind(this),
          act: function (oContext) {
            return {
              text: this.get18().getText(
                "AprobacionController.AgrupadoPor",
                this.get18().getText("ViewSettingsDialogFragment.Actividad")
              ),
            };
          }.bind(this),
          pro: function (oContext) {
            return {
              text: this.get18().getText(
                "AprobacionController.AgrupadoPor",
                this.get18().getText("ViewSettingsDialogFragment.Proceso")
              ),
            };
          }.bind(this),
          C5: function (oContext) {
            return {
              text: this.get18().getText(
                "AprobacionController.AgrupadoPor",
                this.get18().getText("ViewSettingsDialogFragment.FechaDeCreacin")
              ),
            };
          }.bind(this),
        };
      },
      addDescrp: function (oRes) {
        var flowDesc = this.getOwnerComponent().flowDescMap;
        oRes.forEach(element => {
          var flujo = flowDesc.find(x => x[element.C2]);
          if (flujo) {
            var desc = flujo[element.C2];
            element.block = desc.txt;
            var descAct = desc.act.find(x => x[element.C3]);
            element.act = descAct[element.C3].txt;
            var descPro = descAct[element.C3].pro.find(x => x[element.C4]);
            element.pro = descPro[element.C4];
          };
        });
        console.log('');
      },
      onSelectionChange: function (oEvent) {
        var oObject = oEvent
          .getParameter("listItem")
          .getBindingContext("lazyModel")
          .getObject();
        oObject.icon = this.byId("list").getSelectedItem().getAggregation('content')[0].getAggregation('items')[0].getAggregation("items").find(x => x.sId.includes("aprovalIcon")).getSrc();
        var approvalModel = this.getOwnerComponent().getAprovalModel();
        approvalModel.setProperty("/", oObject);
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("userDetailRoute",{code: oObject.Code});
        oRouter.navTo("RouteApprovalFlowView", {
          flow: oObject.C7,
        });
      },

      onSearch: function (oEvent) {
        console.log('Event Handler: onSearch');
        this.getListData();        
      },

      onLocalSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        if (sQuery) {
          var aFilter = [
            new Filter("C6", FilterOperator.Contains, sQuery),
            new Filter("block", FilterOperator.Contains, sQuery),
            new Filter("act", FilterOperator.Contains, sQuery),
            new Filter("pro", FilterOperator.Contains, sQuery)
          ];
        }
        this._oList.getBinding("items").filter(
          new Filter({
            filters: aFilter,
            and: false
          }), "Application");
      },

      onOpenViewSettings: function (oEvent) {
        var sDialogTab = "filter";
        if (oEvent.getSource() instanceof sap.m.Button) {
          var sButtonId = oEvent.getSource().getId();
          if (sButtonId.match("sort")) {
            sDialogTab = "sort";
          } else if (sButtonId.match("group")) {
            sDialogTab = "group";
          }
        }
        // load asynchronous XML fragment
        if (!this.byId("viewSettingsDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "bafar.flujos.flujos.view.fragments.ViewSettingsDialog",
            controller: this,
          }).then(
            function (oDialog) {
              // connect dialog to the root view of this component (models, lifecycle)
              this.getView().addDependent(oDialog);
              // oDialog.addStyleClass(
              //   this.getOwnerComponent().getContentDensityClass()
              // );
              oDialog.open(sDialogTab);
            }.bind(this)
          );
        } else {
          this.byId("viewSettingsDialog").open(sDialogTab);
        }
      },
      onConfirmViewSettingsDialog: function (oEvent) {
        // update filter state:
        // combine the filter array and the filter string
        this._applySortGroup(oEvent)
      },
      _applySortGroup: function (oEvent) {
        var mParams = oEvent.getParameters(),
          sPath,
          bDescending,
          aSorters = [];
        // apply sorter to binding
        // (grouping comes before sorting)
        if (mParams.groupItem) {
          sPath = mParams.groupItem.getKey();
          bDescending = mParams.groupDescending;
          var vGroup = this._oGroupFunctions[sPath];
          aSorters.push(new Sorter(sPath, bDescending, vGroup));
        }
        sPath = mParams.sortItem.getKey();
        bDescending = mParams.sortDescending;
        aSorters.push(new Sorter(sPath, bDescending));
        this._oList.getBinding("items").sort(aSorters);
      },
      setHeaderTitle: function (user){
        this.byId("titleText").setText(this.get18().getText("AprobacionController.Usuario", [user]));
      },
      getListData: function () {
        console.log("loaded");
        this.createModel = this.getModel("createModel");
        var oPayload = {
          P1: "LAPP",
          //P2: "SY-UNAME",
          P2: "925",
          to_pesal: []
        };
        var that = this;
        this.createModel.create("/BaseSet", oPayload, {
          async: true,
          success: function (req, res) {
            that.addDescrp(res.data.to_pesal.results);
            that.setModel(new JSONModel(res.data.to_pesal.results), "lazyModel");
            that.tabModel = that.getModel("lazyModel");
            that.setHeaderTitle(res.data.P2);
          },
          error: function (error) {
            MessageBox.error(error.responseText);
          }
        });
        // var oModelData = {
        //   IniSet: [{
        //       Name: "asdsad",
        //       tipo: "NOM",
        //       color: "Accent1",
        //       state: "Error",
        //       Role: "asdfffasdfasfdasddfasfaasdfasdfasdfasdfs"
        //     },
        //     {
        //       Name: "xxxxxx",
        //       tipo: "FI",
        //       color: "Accent2",
        //       state: "Success",
        //       Role: "asdfffasdfasfdasddfasdfasdfasdfasdfasfas"
        //     },
        //   ],
        // };
      }
    });
  }
);