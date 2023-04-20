export const MockVariables = {
  StartEvent_1: {
    out: [
      {
        name: "Invoice",
        info: "Context",
        entries: [
          {
            name: "invoiceNr",
            origin: ["StartEvent_1"]
          },
          {
            name: "amount",
            origin: ["StartEvent_1"]
          }
        ]
      }
    ]
  },
  assignApprover: {
    out: [
      {
        name: "approverGroup",
        info: "String"
      }
    ]
  },
  approveInvoice: {
    uses: ["approverGroup", "Invoice"],
    out: [
      {
        name: "Invoice",
        info: "Context",
        entries: [
          {
            name: "approved",
            info: "bool",
            origin: ["approveInvoice"]
          }
        ]
      }
    ]
  },
  reviewInvoice: {
    uses: ["Invoice"],
    out: [
      {
        name: "clarified",
        info: "Boolean"
      }
    ]
  },
  prepareBankTransfer: {
    uses: ["Invoice"],
    out: [
      {
        name: "bankTransfer",
        info: "Object",
        entries: [
          { name: "Invoice", ref: "Invoice" },
          { name: "IBAN", origin: ["prepareBankTransfer"] }
        ]
      }
    ]
  }
  // notApproved: {
  //   uses: ["approved"]
  // },
  // approved: {
  //   uses: ["approved"]
  // }
};

class MockVariableResolver {
  getVariablesForElement(element) {
    const result = [];

    for (const [key, value] of Object.entries(MockVariables)) {
      value.out && result.push(...value.out);
    }
    return result;
  }

  getProcessVariables() {
    const allVariables = Object.entries(MockVariables).reduce(
      (acc, [key, entry]) => {
        entry.out &&
          entry.out.forEach((v) => {
            const existingVar = acc[v.name] || {
              name: v.name,
              origin: [],
              consumed: [],
              entries: [],
              scope: "Process_Engine_1"
            };

            existingVar.origin.push(key);
            v.entries && existingVar.entries.push(...v.entries);
            acc[v.name] = existingVar;
          });

        entry.uses &&
          entry.uses.forEach((v) => {
            const existingVar = acc[v] || {
              name: v,
              origin: [],
              consumed: [],
              scope: "Process_Engine_1"
            };

            existingVar.consumed.push(key);

            acc[v] = existingVar;
          });

        return acc;
      },
      {}
    );

    // Resolver refs
    for (const entry of Object.values(allVariables)) {
      resolveReference(entry, allVariables);
    }
    return allVariables;
  }
}

export default {
  __init__: ["variableResolver"],
  variableResolver: ["type", MockVariableResolver]
};

function resolveReference(variable, allToplevel) {
  if (!variable.entries) {
    return;
  }

  variable.entries = variable.entries.map((entry) => {
    if (entry.ref) {
      return {
        ...allToplevel[entry.ref],
        referenced: true
      };
    } else {
      resolveReference(entry, allToplevel);
    }
    return entry;
  });
}
