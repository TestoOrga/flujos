sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController,
  JSONModel) {
  "use strict";

  return BaseController.extend(
    "bafar.flujos.flujos.controller.Comunes.ArchivosMultiple", {
      /**
       * @override
       */
      onInit: function () {
        this.setModel(new JSONModel([{
            Archivo: "1",
            Iddoc: "qwe",
            Erdat: "20200801"
          },
          {
            Archivo: "2",
            Iddoc: "wqe",
            Erdat: "20210804"
          },
        ]), "files");

      }
    }
  );
});