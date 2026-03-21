import type { SiteConfig } from "@luciodale/docs-ui-kit/types/config";

export const siteConfig: SiteConfig = {
	title: "swipe-bar",
	description:
		"A zero-dependency React library for native swipe sidebars and bottom sheets. Touch gestures, programmatic control, typed metadata, and full accessibility out of the box.",
	siteUrl: "https://koolcodez.com/projects/swipe-bar",
	logoSrc: "/logo.svg",
	logoAlt: "swipe-bar logo",
	ogImage: "/og-image.png",
	installCommand: "npm install @luciodale/swipe-bar",
	githubUrl: "https://github.com/luciodale/swipe-bar",
	author: "Lucio D'Alessandro",
	socialLinks: {
		github: "https://github.com/luciodale",
		linkedin: "https://www.linkedin.com/in/luciodale",
	},
	navLinks: [
		{ href: "/docs/getting-started", label: "Docs" },
		{ href: "/example/left-right-sidebar", label: "Examples" },
	],
	sidebarSections: [
		{
			title: "Getting Started",
			links: [
				{ href: "/docs/getting-started", label: "Introduction" },
				{ href: "/docs/configuration", label: "Configuration" },
				{ href: "/docs/api", label: "API Reference" },
			],
		},
		{
			title: "Guides",
			links: [
				{ href: "/docs/bottom-sheets", label: "Bottom Sheets" },
				{ href: "/docs/sidebar-meta", label: "Sidebar Meta" },
			],
		},
		{
			title: "Examples",
			links: [
				{ href: "/example/left-right-sidebar", label: "Left & Right Sidebar" },
				{ href: "/example/bottom-sheet", label: "Bottom Sheet" },
				{ href: "/example/multi-instance", label: "Multi-Instance" },
				{ href: "/example/multi-instance-left-right", label: "Multi-Instance Left & Right" },
				{ href: "/example/custom-toggle", label: "Custom Toggle" },
				{ href: "/example/props-playground", label: "Props Playground" },
			],
		},
	],
	copyright: "Lucio D'Alessandro",
	parentSite: {
		href: "https://koolcodez.com/projects",
		label: "koolcodez",
		logoSrc: "/kool-codez-illustration.svg",
	},
};
