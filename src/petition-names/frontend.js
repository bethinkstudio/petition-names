/**
 * Frontend JavaScript for Petition Names block pagination
 */

document.addEventListener("DOMContentLoaded", function () {
	const petitionLists = document.querySelectorAll(".petition-names-list");

	petitionLists.forEach(function (listContainer) {
		const paginationContainer = listContainer.querySelector(
			".petition-names-pagination",
		);
		const entriesContainer = listContainer.querySelector(
			".petition-names-entries",
		);
		const loadingIndicator = listContainer.querySelector(
			".petition-names-loading",
		);

		if (!paginationContainer || !entriesContainer) {
			return;
		}

		// Get configuration from data attributes
		const config = {
			formId: listContainer.dataset.formId,
			nameFieldId: listContainer.dataset.nameFieldId,
			emailFieldId: listContainer.dataset.emailFieldId || 0,
			itemsPerPage: parseInt(listContainer.dataset.itemsPerPage) || 60,
			pinnedEntries: JSON.parse(listContainer.dataset.pinnedEntries || "[]"),
		};

		// Handle pagination button clicks
		paginationContainer.addEventListener("click", function (event) {
			if (!event.target.classList.contains("petition-page-btn")) {
				return;
			}

			event.preventDefault();

			const pageNumber = parseInt(event.target.dataset.page);
			const currentPage = parseInt(paginationContainer.dataset.currentPage);

			if (pageNumber === currentPage || event.target.disabled) {
				return;
			}

			loadPage(pageNumber);
		});

		function loadPage(pageNumber) {
			// Show loading indicator
			showLoading();

			// Disable all pagination buttons
			const buttons =
				paginationContainer.querySelectorAll(".petition-page-btn");
			buttons.forEach((btn) => (btn.disabled = true));

			// Build API endpoint URL
			const apiUrl = `${wpApiSettings.root}petition-names/v1/forms/${config.formId}/entries/page/${pageNumber}`;

			// Build query parameters
			const params = new URLSearchParams({
				nameFieldId: config.nameFieldId,
				itemsPerPage: config.itemsPerPage,
			});

			if (config.emailFieldId > 0) {
				params.append("emailFieldId", config.emailFieldId);
			}

			if (config.pinnedEntries.length > 0) {
				params.append("pinnedEntryIds", JSON.stringify(config.pinnedEntries));
			}

			// Make API request
			fetch(`${apiUrl}?${params.toString()}`, {
				method: "GET",
				headers: {
					"X-WP-Nonce": wpApiSettings.nonce,
				},
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then((data) => {
					// Update entries
					updateEntries(data.entries);

					// Update pagination
					updatePagination(data.pagination);

					// Hide loading indicator
					hideLoading();

					// Scroll to top of list
					listContainer.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				})
				.catch((error) => {
					console.error("Pagination error:", error);
					hideLoading();

					// Re-enable buttons on error
					buttons.forEach((btn) => (btn.disabled = false));

					// Show error message (you could make this more user-friendly)
					alert("Error loading page. Please try again.");
				});
		}

		function updateEntries(entries) {
			// Clear existing entries
			entriesContainer.innerHTML = "";

			// Add new entries
			entries.forEach(function (entry, index) {
				const li = document.createElement("li");
				li.style.animationDelay = `${index * 0.05}s`; // Staggered animation

				let html = "";

				// Add gravatar if available
				if (entry.gravatar_hash) {
					html += `<img src="https://www.gravatar.com/avatar/${entry.gravatar_hash}?s=32&d=mp" alt="" class="petition-names-gravatar" /> `;
				}

				// Add name
				html += escapeHtml(entry.name);

				li.innerHTML = html;
				entriesContainer.appendChild(li);
			});
		}

		function updatePagination(pagination) {
			// Update current page data attribute
			paginationContainer.dataset.currentPage = pagination.current_page;

			// Update button states
			const buttons =
				paginationContainer.querySelectorAll(".petition-page-btn");
			buttons.forEach(function (btn) {
				const btnPage = parseInt(btn.dataset.page);
				btn.disabled = false;

				if (btnPage === pagination.current_page) {
					btn.classList.add("current");
					btn.disabled = true;
				} else {
					btn.classList.remove("current");
				}
			});
		}

		function showLoading() {
			if (loadingIndicator) {
				loadingIndicator.style.display = "block";
			}
			entriesContainer.style.opacity = "0.5";
		}

		function hideLoading() {
			if (loadingIndicator) {
				loadingIndicator.style.display = "none";
			}
			entriesContainer.style.opacity = "1";
		}

		function escapeHtml(text) {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		}
	});
});
