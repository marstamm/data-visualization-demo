import { render } from "preact";
import { html } from "htm/preact";

const panel = document.getElementById("scrollContainer");

export default function (variableResolver, overlays, elementRegistry, canvas) {
  const allVars = variableResolver.getProcessVariables();

  let overlayIds = [];
  let highlightedElements = [];

  function addOverlay(elementId, position, html) {
    const element = elementRegistry.get(elementId);

    if (!element) {
      return;
    }

    const div = document.createElement("div");
    div.setAttribute("class", "data-overlay");

    overlayIds.push(
      overlays.add(element, {
        position: position,
        html: div
      })
    );

    render(html, div);
  }

  function highligt(id) {
    const element = elementRegistry.get(id);

    if (!element) {
      return;
    }

    canvas.addMarker(element, "highlight");
    highlightedElements.push(element);
  }

  function clearOverlays() {
    overlayIds.forEach((id) => overlays.remove(id));
    overlayIds = [];

    highlightedElements.forEach((el) => canvas.removeMarker(el, "highlight"));
    highlightedElements = [];
  }

  function select(variable) {
    clearOverlays();

    // highligt(variable.scope);
    variable.origin.forEach((origin) => {
      highligt(origin);
      addOverlay(
        origin,
        { top: 0, right: 10 },
        variableList([variable], {
          filter: (e) => e.origin.includes(origin) || e.referenced,
          topIcon: "sign-out"
        })
      );
    });

    variable.consumed &&
      variable.consumed.forEach((consumer) => {
        highligt(consumer);

        addOverlay(
          consumer,
          { top: 0, left: -10 },
          html`<div class="ui list">
            <div class="item">
              <i class="sign-in icon"></i>
              <div class="content">
                <div class="header">${variable.name}</div>
              </div>
            </div>
          </div>`
        );
      });
  }

  function variableList(
    entries,
    options = {
      filter: () => true
    }
  ) {
    if (!entries) {
      return;
    }

    const { filter, topIcon } = options;

    return html`<div class="ui list">
      ${entries.filter(filter).map((e) => {
        console.log(e);
        return html`<div class="item">
          <i
            onClick=${() => select(e)}
            class="${topIcon ? topIcon : e.entries ? "tags" : "tag"} icon"
          ></i>
          <div class="content">
            <div onClick=${() => select(e)} class="header">${e.name}</div>
            <div class="description">
              Written in ${e.origin.join(", ")}
            </div>
            ${e.entries &&
            variableList(e.entries, { ...options, topIcon: null })}
          </div>
        </div>`;
      })}
    </div>`;
  }

  render(variableList(Object.values(allVars)), panel);
}
