"use strict";

import { CSSStylesheet } from "@qualweb/core";
import css from "css";
import Technique from "../lib/Technique.object";
import { CSSTechnique } from '../lib/decorator';
import { QWElement } from '@qualweb/qw-element';

@CSSTechnique
class QW_CSS_T4 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  executeElement(element: QWElement): void {

  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if (styleSheet.content && styleSheet.content.plain) {
        this.analyseAST(styleSheet.content.parsed, styleSheet.file);
      }
    }
  }
  analyseAST(cssObject: any, fileName: string): void {
    if (
      cssObject === undefined ||
      cssObject["type"] === "comment" ||
      cssObject["type"] === "keyframes" ||
      cssObject["type"] === "import"
    ) {
      // ignore
      return;
    }
    if (
      cssObject["type"] === "rule" ||
      cssObject["type"] === "font-face" ||
      cssObject["type"] === "page"
    ) {
      this.loopDeclarations(cssObject, fileName);
    } else {
      if (cssObject["type"] === "stylesheet") {
        for (const key of cssObject["stylesheet"]["rules"] || []) {
          this.analyseAST(key, fileName);
        }
      } else {
        for (const key of cssObject["rules"] || []) {
          this.analyseAST(key, fileName);
        }
      }
    }
  }

  loopDeclarations(cssObject: any, fileName: string): void {
    let declarations = cssObject["declarations"];
    if (declarations) {
      for (const declaration of declarations || []) {
        if (declaration["property"] && declaration["value"]) {
          this.extractInfo(cssObject, declaration, fileName);
        }
      }
    }
  }

  extractInfo(cssObject: any, declaration: any, fileName: string): void {
    const names = [
      "font-family",
      "text-align",
      "font-size",
      "font-style",
      "font-weight",
      "color",
      "line-height",
      "text-transform",
      "letter-spacing",
      "background-image",
      "first-line",
      ":first-letter",
      ":before",
      ":after"
    ];

    if (names.includes(declaration["property"])) {
      super.fillEvaluation(
        'RC1',
        "passed",
        `Element uses CSS properties to control the visual presentation of text`,
        css.stringify({
          type: "stylesheet",
          stylesheet: { rules: [cssObject] }
        }),
        fileName,
        cssObject["selectors"] ? cssObject["selectors"].toString() : "",
        cssObject["position"],
        declaration["property"],
        declaration["value"],
        declaration["position"]
      );
    } else {
      super.fillEvaluation(
        'RC2',
        "inapplicable",
        `Element does not use CSS properties to control the visual presentation of text`
      );
    }
  }
}

export = QW_CSS_T4;
