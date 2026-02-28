/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/petition-names/edit.js"
/*!************************************!*\
  !*** ./src/petition-names/edit.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor.scss */ "./src/petition-names/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */


/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */





/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */

function Edit({
  attributes,
  setAttributes
}) {
  const {
    formId,
    nameFieldId,
    pinnedEntryIds = []
  } = attributes;
  const [forms, setForms] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [fields, setFields] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [entrySearch, setEntrySearch] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("");
  const [entryResults, setEntryResults] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [previewEntries, setPreviewEntries] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [loadingPreview, setLoadingPreview] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [loadingEntrySearch, setLoadingEntrySearch] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [entryLabels, setEntryLabels] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)({});
  const [loadingForms, setLoadingForms] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [loadingFields, setLoadingFields] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)("");
  const pinnedSet = new Set((pinnedEntryIds || []).map(id => Number(id)));
  const formOptions = [{
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("-- Select Form --", "petition-names"),
    value: ""
  }, ...forms.map(form => ({
    label: form.title,
    value: String(form.id)
  }))];
  const nameFieldOptions = [{
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("-- Select Name Field --", "petition-names"),
    value: ""
  }, ...fields.filter(field => field.type === "name" || field.inputType === "text" || field.inputType === "name").map(field => ({
    label: field.label,
    value: String(field.id)
  }))];

  // Fetch Gravity Forms list
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    setLoadingForms(true);
    setError("");
    wp.apiFetch({
      path: "/gf/v2/forms"
    }).then(data => {
      setForms(Object.values(data) || []);
      setLoadingForms(false);
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Could not load forms. Is Gravity Forms REST API enabled?", "petition-names"));
      setLoadingForms(false);
    });
  }, []);

  // Fetch fields for selected form
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!formId) return;
    setLoadingFields(true);
    setError("");
    wp.apiFetch({
      path: `/gf/v2/forms/${formId}`
    }).then(data => {
      console.log("Form data:", data);
      setFields(data.fields || []);
      setLoadingFields(false);
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Could not load fields for this form.", "petition-names"));
      setLoadingFields(false);
    });
  }, [formId]);
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!formId || !nameFieldId) {
      setEntryResults([]);
      setLoadingEntrySearch(false);
      return;
    }
    if (entrySearch.trim().length < 2) {
      setEntryResults([]);
      setLoadingEntrySearch(false);
      return;
    }
    setLoadingEntrySearch(true);
    const timeoutId = setTimeout(() => {
      wp.apiFetch({
        path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(nameFieldId)}&search=${encodeURIComponent(entrySearch.trim())}`
      }).then(data => {
        setEntryResults(Array.isArray(data) ? data : []);
        setEntryLabels(current => {
          const next = {
            ...current
          };
          (data || []).forEach(entry => {
            next[entry.id] = entry.name || `#${entry.id}`;
          });
          return next;
        });
        setLoadingEntrySearch(false);
      }).catch(() => {
        setEntryResults([]);
        setLoadingEntrySearch(false);
      });
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [formId, nameFieldId, entrySearch]);
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!formId || !nameFieldId || !pinnedEntryIds.length) {
      return;
    }
    wp.apiFetch({
      path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(nameFieldId)}&ids=${encodeURIComponent(pinnedEntryIds.join(","))}`
    }).then(data => {
      setEntryLabels(current => {
        const next = {
          ...current
        };
        (data || []).forEach(entry => {
          next[entry.id] = entry.name || `#${entry.id}`;
        });
        return next;
      });
    }).catch(() => {});
  }, [formId, nameFieldId, pinnedEntryIds]);
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!formId || !nameFieldId) {
      setPreviewEntries([]);
      setLoadingPreview(false);
      return;
    }
    setLoadingPreview(true);
    wp.apiFetch({
      path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(nameFieldId)}&limit=10`
    }).then(data => {
      const recentEntries = Array.isArray(data) ? data : [];
      const pinnedEntries = pinnedEntryIds.map(id => ({
        id,
        name: entryLabels[id] || `#${id}`
      })).filter(entry => entry.name);
      const combined = [...pinnedEntries, ...recentEntries].reduce((accumulator, entry) => {
        if (accumulator.some(existing => Number(existing.id) === Number(entry.id))) {
          return accumulator;
        }
        return [...accumulator, entry];
      }, []);
      setPreviewEntries(combined.slice(0, 10));
      setEntryLabels(current => {
        const next = {
          ...current
        };
        recentEntries.forEach(entry => {
          next[entry.id] = entry.name || `#${entry.id}`;
        });
        return next;
      });
      setLoadingPreview(false);
    }).catch(() => {
      setPreviewEntries([]);
      setLoadingPreview(false);
    });
  }, [formId, nameFieldId, pinnedEntryIds]);
  const togglePinnedEntry = entryId => {
    const normalizedId = Number(entryId);
    if (pinnedSet.has(normalizedId)) {
      setAttributes({
        pinnedEntryIds: pinnedEntryIds.filter(id => Number(id) !== normalizedId)
      });
      return;
    }
    setAttributes({
      pinnedEntryIds: [...pinnedEntryIds, normalizedId]
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Data source", "petition-names"),
        initialOpen: true,
        children: [loadingForms ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Select a Gravity Form", "petition-names"),
          value: formId,
          options: formOptions,
          onChange: value => {
            setAttributes({
              formId: value,
              nameFieldId: "",
              pinnedEntryIds: []
            });
          }
        }), formId && (loadingFields ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Select the Name Field", "petition-names"),
          value: nameFieldId,
          options: nameFieldOptions,
          onChange: value => setAttributes({
            nameFieldId: value,
            pinnedEntryIds: []
          })
        }))]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Pinned submissions", "petition-names"),
        initialOpen: false,
        children: !formId || !nameFieldId ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Select a form and name field first to enable submission pinning.", "petition-names")
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Search submissions", "petition-names"),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Type at least 2 characters, then pin entries to keep them at the top.", "petition-names"),
            value: entrySearch,
            onChange: setEntrySearch
          }), loadingEntrySearch && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}), entryResults.map(entry => {
            const isPinned = pinnedSet.has(Number(entry.id));
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
                children: entry.name || `#${entry.id}`
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                variant: isPinned ? "secondary" : "primary",
                onClick: () => togglePinnedEntry(entry.id),
                children: isPinned ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Unpin", "petition-names") : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Pin", "petition-names")
              })]
            }, entry.id);
          }), pinnedEntryIds.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            style: {
              marginTop: "12px"
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Pinned", "petition-names")
            }), pinnedEntryIds.map(entryId => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
              style: {
                marginTop: "6px"
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                variant: "link",
                onClick: () => togglePinnedEntry(entryId),
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Unpin", "petition-names")
              }), " ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
                children: entryLabels[entryId] || `#${entryId}`
              })]
            }, entryId))]
          })]
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)(),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h4", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Petition Names Block", "petition-names")
      }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        style: {
          color: "red"
        },
        children: error
      }), !formId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Select a form in the block settings sidebar.", "petition-names")
      }), formId && !nameFieldId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Select a name field in the block settings sidebar.", "petition-names")
      }), formId && nameFieldId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          style: {
            color: "green",
            marginBottom: "8px"
          },
          children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Ready! This block will show a paginated list of first names and last initials from this form.", "petition-names"), pinnedEntryIds.length > 0 && ` ${pinnedEntryIds.length} ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("submission(s) pinned.", "petition-names")}`]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Editor preview", "petition-names")
        }), loadingPreview ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          style: {
            marginTop: "8px"
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {})
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("ul", {
          style: {
            marginTop: "8px",
            paddingLeft: "20px"
          },
          children: previewEntries.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("li", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("No entries found yet.", "petition-names")
          }) : previewEntries.map(entry => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("li", {
            children: [entry.name || `#${entry.id}`, pinnedSet.has(Number(entry.id)) && " 📌"]
          }, entry.id))
        })]
      })]
    })]
  });
}

/***/ },

/***/ "./src/petition-names/index.js"
/*!*************************************!*\
  !*** ./src/petition-names/index.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./src/petition-names/style.scss");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit */ "./src/petition-names/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/petition-names/block.json");
/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */


/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * Internal dependencies
 */



/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  /**
   * @see ./edit.js
   */
  edit: props => (0,_edit__WEBPACK_IMPORTED_MODULE_2__["default"])(props)
});

/***/ },

/***/ "./src/petition-names/editor.scss"
/*!****************************************!*\
  !*** ./src/petition-names/editor.scss ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/petition-names/style.scss"
/*!***************************************!*\
  !*** ./src/petition-names/style.scss ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./src/petition-names/block.json"
/*!***************************************!*\
  !*** ./src/petition-names/block.json ***!
  \***************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"bethink/petition-names","version":"0.1.0","title":"Petition Names","category":"widgets","icon":"groups","description":"A block to display a list of names from a Gravity Forms petition.","example":{},"supports":{"html":false},"textdomain":"petition-names","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","render":"file:./render.php","attributes":{"formId":{"type":"string","default":""},"nameFieldId":{"type":"string","default":""},"pinnedEntryIds":{"type":"array","default":[],"items":{"type":"number"}}}}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"petition-names/index": 0,
/******/ 			"petition-names/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkpetition_names"] = globalThis["webpackChunkpetition_names"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["petition-names/style-index"], () => (__webpack_require__("./src/petition-names/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map