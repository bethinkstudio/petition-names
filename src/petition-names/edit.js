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
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	Button,
	PanelBody,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	__experimentalNumberControl as NumberControl,
} from "@wordpress/components";
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
	const {
		formId,
		nameFieldId,
		pinnedEntryIds = [],
		itemsPerPage = 60,
		columnWidth = 125,
		showGravatars = false,
		emailFieldId = "",
	} = attributes;
	const [forms, setForms] = useState([]);
	const [fields, setFields] = useState([]);
	const [entrySearch, setEntrySearch] = useState("");
	const [entryResults, setEntryResults] = useState([]);
	const [previewEntries, setPreviewEntries] = useState([]);
	const [loadingPreview, setLoadingPreview] = useState(false);
	const [loadingEntrySearch, setLoadingEntrySearch] = useState(false);
	const [entryLabels, setEntryLabels] = useState({});
	const [pinnedEntriesData, setPinnedEntriesData] = useState([]);
	const [loadingForms, setLoadingForms] = useState(false);
	const [loadingFields, setLoadingFields] = useState(false);
	const [error, setError] = useState("");
	const pinnedSet = new Set((pinnedEntryIds || []).map((id) => Number(id)));
	const formOptions = [
		{ label: __("-- Select Form --", "petition-names"), value: "" },
		...forms.map((form) => ({
			label: form.title,
			value: String(form.id),
		})),
	];
	const nameFieldOptions = [
		{ label: __("-- Select Name Field --", "petition-names"), value: "" },
		...fields
			.filter(
				(field) =>
					field.type === "name" ||
					field.inputType === "text" ||
					field.inputType === "name",
			)
			.map((field) => ({
				label: field.label,
				value: String(field.id),
			})),
	];

	const emailFieldOptions = [
		{ label: __("-- Select Email Field --", "petition-names"), value: "" },
		...fields
			.filter((field) => field.type === "email" || field.inputType === "email")
			.map((field) => ({
				label: field.label,
				value: String(field.id),
			})),
	];

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

	useEffect(() => {
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
			const emailParam =
				showGravatars && emailFieldId
					? `&emailFieldId=${encodeURIComponent(emailFieldId)}`
					: "";
			wp.apiFetch({
				path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(
					nameFieldId,
				)}&search=${encodeURIComponent(entrySearch.trim())}${emailParam}`,
			})
				.then((data) => {
					setEntryResults(Array.isArray(data) ? data : []);
					setEntryLabels((current) => {
						const next = { ...current };
						(data || []).forEach((entry) => {
							next[entry.id] = entry.name || `#${entry.id}`;
						});
						return next;
					});
					setLoadingEntrySearch(false);
				})
				.catch(() => {
					setEntryResults([]);
					setLoadingEntrySearch(false);
				});
		}, 250);

		return () => clearTimeout(timeoutId);
	}, [formId, nameFieldId, entrySearch, showGravatars, emailFieldId]);

	useEffect(() => {
		if (!formId || !nameFieldId || !pinnedEntryIds.length) {
			return;
		}

		const emailParam =
			showGravatars && emailFieldId
				? `&emailFieldId=${encodeURIComponent(emailFieldId)}`
				: "";
		wp.apiFetch({
			path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(
				nameFieldId,
			)}&ids=${encodeURIComponent(pinnedEntryIds.join(","))}${emailParam}`,
		})
			.then((data) => {
				const pinnedData = Array.isArray(data) ? data : [];
				setPinnedEntriesData(pinnedData);
				setEntryLabels((current) => {
					const next = { ...current };
					pinnedData.forEach((entry) => {
						next[entry.id] = entry.name || `#${entry.id}`;
					});
					return next;
				});
			})
			.catch(() => {});
	}, [formId, nameFieldId, pinnedEntryIds, showGravatars, emailFieldId]);

	useEffect(() => {
		if (!formId || !nameFieldId) {
			setPreviewEntries([]);
			setLoadingPreview(false);
			return;
		}

		setLoadingPreview(true);
		const emailParam =
			showGravatars && emailFieldId
				? `&emailFieldId=${encodeURIComponent(emailFieldId)}`
				: "";
		wp.apiFetch({
			path: `/petition-names/v1/forms/${formId}/entries?nameFieldId=${encodeURIComponent(
				nameFieldId,
			)}&limit=${itemsPerPage}${emailParam}`,
		})
			.then((data) => {
				const recentEntries = Array.isArray(data) ? data : [];
				const pinnedEntries = pinnedEntriesData.filter((entry) =>
					pinnedEntryIds.includes(Number(entry.id)),
				);

				const combined = [...pinnedEntries, ...recentEntries].reduce(
					(accumulator, entry) => {
						if (
							accumulator.some(
								(existing) => Number(existing.id) === Number(entry.id),
							)
						) {
							return accumulator;
						}

						return [...accumulator, entry];
					},
					[],
				);

				setPreviewEntries(combined.slice(0, itemsPerPage));
				setEntryLabels((current) => {
					const next = { ...current };
					recentEntries.forEach((entry) => {
						next[entry.id] = entry.name || `#${entry.id}`;
					});
					return next;
				});
				setLoadingPreview(false);
			})
			.catch(() => {
				setPreviewEntries([]);
				setLoadingPreview(false);
			});
	}, [formId, nameFieldId, pinnedEntryIds, showGravatars, emailFieldId]);

	const togglePinnedEntry = (entryId) => {
		const normalizedId = Number(entryId);
		if (pinnedSet.has(normalizedId)) {
			setAttributes({
				pinnedEntryIds: pinnedEntryIds.filter(
					(id) => Number(id) !== normalizedId,
				),
			});
			return;
		}

		setAttributes({
			pinnedEntryIds: [...pinnedEntryIds, normalizedId],
		});
	};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__("Data source", "petition-names")}
					initialOpen={true}
				>
					{loadingForms ? (
						<Spinner />
					) : (
						<SelectControl
							label={__("Select a Gravity Form", "petition-names")}
							value={formId}
							options={formOptions}
							onChange={(value) => {
								setAttributes({
									formId: value,
									nameFieldId: "",
									pinnedEntryIds: [],
								});
							}}
						/>
					)}

					{formId &&
						(loadingFields ? (
							<Spinner />
						) : (
							<SelectControl
								label={__("Select the Name Field", "petition-names")}
								value={nameFieldId}
								options={nameFieldOptions}
								onChange={(value) =>
									setAttributes({
										nameFieldId: value,
										pinnedEntryIds: [],
									})
								}
							/>
						))}

					<ToggleControl
						label={__("Show profile pictures", "petition-names")}
						help={__(
							"Display gravatar images based on email addresses",
							"petition-names",
						)}
						checked={showGravatars}
						onChange={(value) => setAttributes({ showGravatars: value })}
					/>

					{showGravatars && (
						<SelectControl
							label={__("Select the Email Field", "petition-names")}
							value={emailFieldId}
							options={emailFieldOptions}
							onChange={(value) => setAttributes({ emailFieldId: value })}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__("Display Settings", "petition-names")}
					initialOpen={false}
				>
					<NumberControl
						label={__("Items per page", "petition-names")}
						help={__(
							"Number of names to display per page (3-200, increments of 5)",
							"petition-names",
						)}
						value={itemsPerPage}
						min={3}
						max={200}
						step={5}
						onChange={(value) => {
							const numValue = parseInt(value, 10);
							if (!isNaN(numValue) && numValue >= 3 && numValue <= 200) {
								setAttributes({ itemsPerPage: numValue });
							}
						}}
					/>
					<NumberControl
						label={__("Column width", "petition-names")}
						help={__(
							"Width of each column in pixels (50-400px)",
							"petition-names",
						)}
						value={columnWidth}
						min={50}
						max={400}
						step={5}
						onChange={(value) => {
							const numValue = parseInt(value, 10);
							if (!isNaN(numValue) && numValue >= 50 && numValue <= 400) {
								setAttributes({ columnWidth: numValue });
							}
						}}
					/>
				</PanelBody>
				<PanelBody
					title={__("Pinned submissions", "petition-names")}
					initialOpen={false}
				>
					{!formId || !nameFieldId ? (
						<p>
							{__(
								"Select a form and name field first to enable submission pinning.",
								"petition-names",
							)}
						</p>
					) : (
						<>
							<TextControl
								label={__("Search submissions", "petition-names")}
								help={__(
									"Type at least 2 characters, then pin entries to keep them at the top.",
									"petition-names",
								)}
								value={entrySearch}
								onChange={setEntrySearch}
							/>
							{loadingEntrySearch && <Spinner />}
							{entryResults.map((entry) => {
								const isPinned = pinnedSet.has(Number(entry.id));
								return (
									<div
										key={entry.id}
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											marginBottom: "8px",
										}}
									>
										<span>{entry.name || `#${entry.id}`}</span>
										<Button
											variant={isPinned ? "secondary" : "primary"}
											onClick={() => togglePinnedEntry(entry.id)}
										>
											{isPinned
												? __("Unpin", "petition-names")
												: __("Pin", "petition-names")}
										</Button>
									</div>
								);
							})}
							{pinnedEntryIds.length > 0 && (
								<div style={{ marginTop: "12px" }}>
									<strong>{__("Pinned", "petition-names")}</strong>
									{pinnedEntryIds.map((entryId) => (
										<div key={entryId} style={{ marginTop: "6px" }}>
											<Button
												variant="link"
												onClick={() => togglePinnedEntry(entryId)}
											>
												{__("Unpin", "petition-names")}
											</Button>{" "}
											<span>{entryLabels[entryId] || `#${entryId}`}</span>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{error && <div style={{ color: "red" }}>{error}</div>}
				{!formId && (
					<div>
						{loadingForms ? (
							<Spinner />
						) : (
							<SelectControl
								label={__("Select a Gravity Form", "petition-names")}
								value={formId}
								options={formOptions}
								onChange={(value) => {
									setAttributes({
										formId: value,
										nameFieldId: "",
										pinnedEntryIds: [],
									});
								}}
							/>
						)}
					</div>
				)}
				{formId && !nameFieldId && (
					<div>
						{formId &&
							(loadingFields ? (
								<Spinner />
							) : (
								<SelectControl
									label={__("Select the Name Field", "petition-names")}
									value={nameFieldId}
									options={nameFieldOptions}
									onChange={(value) =>
										setAttributes({
											nameFieldId: value,
											pinnedEntryIds: [],
										})
									}
								/>
							))}
					</div>
				)}
				{formId && nameFieldId && (
					<div>
						<strong>{__("Editor preview:", "petition-names")}</strong>
						{loadingPreview ? (
							<div style={{ marginTop: "8px" }}>
								<Spinner />
							</div>
						) : (
							<div
								className="petition-names-list"
								style={{
									"--petition-names-column-width": `${columnWidth}px`,
									marginTop: "8px",
								}}
							>
								<ul>
									{previewEntries.length === 0 ? (
										<li>{__("No entries found yet.", "petition-names")}</li>
									) : (
										previewEntries.map((entry) => (
											<li key={entry.id}>
												{showGravatars && entry.email && (
													<img
														src={`https://www.gravatar.com/avatar/${btoa(
															entry.email.toLowerCase().trim(),
														)}?s=32&d=mp`}
														alt=""
														className="avatar"
													/>
												)}
												<span>
													{entry.name || `#${entry.id}`}
													{pinnedSet.has(Number(entry.id)) && " 📌"}
												</span>
											</li>
										))
									)}
								</ul>
								{/* Sample pagination preview */}
								<div className="petition-names-pagination">
									<span className="current">1</span>
									<span>2</span>
									<span>3</span>
									<span>...</span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
