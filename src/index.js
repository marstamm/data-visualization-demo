import Modeler from "bpmn-js/lib/Modeler";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from "bpmn-js-properties-panel";

import ZeebeModdle from "zeebe-bpmn-moddle/resources/zeebe";

import "bpmn-js-properties-panel/dist/assets/properties-panel.css";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import "./styles.css";

import diagram from "./diagram.bpmn";
import variableResolver from "./modules/variableResolver";
import BottomPanel from "./modules/bottomPanel";

const container = document.getElementById("container");

const modeler = new Modeler({
  container,
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule,
    variableResolver,
    BottomPanel
  ],
  moddleExtensions: {
    zeebe: ZeebeModdle
  },
  propertiesPanel: {
    parent: "#properties-panel-container"
  }
});

modeler
  .importXML(diagram)
  .then(({ warnings }) => {
    console.log("importet");
    if (warnings.length) {
      console.log(warnings);
    }

    const canvas = modeler.get("canvas");

    canvas.zoom("fit-viewport");
  })
  .catch((err) => {
    console.log(err);
  });
