/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from "@wordpress/block-editor";
import { useState, useEffect } from "react";

import "./editor.scss";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { formId, nameFieldId } = attributes;
	const [forms, setForms] = useState([]);
	const [fields, setFields] = useState([]);
	const [loadingForms, setLoadingForms] = useState(false);
	const [loadingFields, setLoadingFields] = useState(false);
	const [error, setError] = useState("");

	// Fetch Gravity Forms list
	useEffect(() => {
		setLoadingForms(true);
		setError("");
		wp.apiFetch({ path: "/gf/v2/forms" })
			.then((data) => {
				setForms(Object.values(data) || []);
				setLoadingForms(false);
			})
			.catch(() => {
				setError(
					__(
						"Could not load forms. Is Gravity Forms REST API enabled?",
						"petition-names",
					),
				);
				setLoadingForms(false);
			});
	}, []);

	// Fetch fields for selected form
	useEffect(() => {
		if (!formId) return;
		setLoadingFields(true);
		setError("");
		wp.apiFetch({ path: `/gf/v2/forms/${formId}` })
			.then((data) => {
				console.log("Form data:", data);
				setFields(data.fields || []);
				setLoadingFields(false);
			})
			.catch(() => {
				setError(__("Could not load fields for this form.", "petition-names"));
				setLoadingFields(false);
			});
	}, [formId]);

	return (
		<div {...useBlockProps()}>
			<h4>{__("Petition Names Block", "petition-names")}</h4>
			{error && <div style={{ color: "red" }}>{error}</div>}
			<div style={{ marginBottom: "1em" }}>
				<label>{__("Select a Gravity Form:", "petition-names")}</label>
				<br />
				{loadingForms ? (
					<span>{__("Loading forms...", "petition-names")}</span>
				) : (
					<select
						value={formId}
						onChange={(e) => {
							setAttributes({ formId: e.target.value, nameFieldId: "" });
						}}
					>
						<option value="">
							{__("-- Select Form --", "petition-names")}
						</option>
						{forms.map((form) => (
							<option key={form.id} value={form.id}>
								{form.title}
							</option>
						))}
					</select>
				)}
			</div>
			{formId && (
				<div style={{ marginBottom: "1em" }}>
					<label>{__("Select the Name Field:", "petition-names")}</label>
					<br />
					{loadingFields ? (
						<span>{__("Loading fields...", "petition-names")}</span>
					) : (
						<select
							value={nameFieldId}
							onChange={(e) => setAttributes({ nameFieldId: e.target.value })}
						>
							<option value="">
								{__("-- Select Name Field --", "petition-names")}
							</option>
							{fields
								.filter(
									(field) =>
										field.type === "name" ||
										field.inputType === "text" ||
										field.inputType === "name",
								)
								.map((field) => (
									<option key={field.id} value={field.id}>
										{field.label}
									</option>
								))}
						</select>
					)}
				</div>
			)}
			{formId && nameFieldId && (
				<div style={{ color: "green" }}>
					{__(
						"Ready! This block will show a paginated list of first names and last initials from this form.",
						"petition-names",
					)}
				</div>
			)}
		</div>
	);
}
