/**
 * WhaTap Design System — root barrel.
 *
 * Chrome(대시보드 쉘) + Widget(AI 메시지 카드) 모두 한 번에 노출.
 * 사용:
 *   import { DashboardLayout, PageHeader, WhaTapAiWidget, AiCard } from "@whatap/design-system";
 *
 * 위젯 전용 import만 쓰고 싶으면:
 *   import { AiCard, AiToneBadge } from "@whatap/design-system/widget";
 */

// Primitives — 재사용 building block (페이지·위젯·다른 컴포넌트가 조립용으로 호출)
export { default as ActiveTransactionSpeedWidget } from "./ActiveTransactionSpeedWidget";
export type {
  ActiveTransactionSpeedWidgetProps,
  SpeedTone,
  SpeedTotals,
} from "./ActiveTransactionSpeedWidget";
export { default as Checkbox } from "./Checkbox";
export type { CheckboxProps, CheckboxSize } from "./Checkbox";
export { default as CountryFlag } from "./CountryFlag";
export type { CountryFlagProps } from "./CountryFlag";
export { default as Chip } from "./Chip";
export type { ChipProps, ChipVariant, ChipTone, ChipSize } from "./Chip";
export { default as TimeChip } from "./TimeChip";
export type { TimeChipProps } from "./TimeChip";
export { default as FilterChip } from "./FilterChip";
export type { FilterChipProps } from "./FilterChip";
export { default as FilterDropdown } from "./FilterDropdown";
export type {
  FilterDropdownProps,
  FilterDropdownOption,
  FilterDropdownPlacement,
} from "./FilterDropdown";
export { default as ActionMenu } from "./ActionMenu";
export type { ActionMenuProps, ActionMenuAction, ActionMenuPlacement } from "./ActionMenu";
export { default as ActionMenuItem } from "./ActionMenuItem";
export type { ActionMenuItemProps, ActionMenuItemTone } from "./ActionMenuItem";
export { default as ListRow } from "./ListRow";
export type { ListRowProps } from "./ListRow";

// ── Product-prototype 사본에서 이관(2026-09-11). 두 벌로 갈라져 있던 DS 를 Platform 하나로 모은다.
export { default as Autocomplete } from "./Autocomplete";
export type { AutocompleteProps, AutocompleteOption, AutocompleteSize } from "./Autocomplete";
export { default as SelectPopover } from "./SelectPopover";
export type {
  SelectPopoverProps,
  SelectPopoverGroup,
  SelectPopoverOption,
  SelectPopoverSize,
} from "./SelectPopover";
export { default as CardHead } from "./CardHead";
export type { CardHeadProps, CardHeadTabs } from "./CardHead";
export { default as WidgetFrame } from "./WidgetFrame";
export type { WidgetFrameProps, WidgetFrameState, WidgetFrameLegendItem } from "./WidgetFrame";
export { default as HeatmapCell, heatmapScaleColor } from "./HeatmapCell";
export type { HeatmapCellProps } from "./HeatmapCell";
export { default as HeatmapLegend } from "./HeatmapLegend";
export type { HeatmapLegendProps } from "./HeatmapLegend";
export { default as Heatmap } from "./Heatmap";
export type { HeatmapProps, HeatmapMode } from "./Heatmap";
export { default as InstanceListItem } from "./InstanceListItem";
export type { InstanceListItemProps, InstanceListItemStatus } from "./InstanceListItem";
export { default as InstanceSelectPanel } from "./InstanceSelectPanel";
export type { InstanceSelectPanelProps, InstanceSelectItem, InstanceSelectScope } from "./InstanceSelectPanel";
export { default as MetricBarCell } from "./MetricBarCell";
export type { MetricBarCellProps, MetricBarSegment } from "./MetricBarCell";
export { default as LabeledField } from "./LabeledField";
export type { LabeledFieldProps } from "./LabeledField";
export { default as DatePicker } from "./DatePicker";
export type { DatePickerProps, DatePickerSize } from "./DatePicker";
export { default as OptionbarNewVersionButton } from "./OptionbarNewVersionButton";
export { default as Multiline } from "./Multiline";
export { default as Breadcrumb } from "./Breadcrumb";
export type { BreadcrumbItem } from "./Breadcrumb";
export { IcSearch } from "./icons/SearchIcon";
export { default as KpiField } from "./KpiField";
export type { KpiFieldProps } from "./KpiField";
export { default as StatCard } from "./StatCard";
export type { StatCardProps, StatCardTone, StatCardTrend } from "./StatCard";
export { default as UsageGauge } from "./UsageGauge";
export type { UsageGaugeProps, UsageGaugeTone } from "./UsageGauge";
export { default as MemberUsageBar } from "./MemberUsageBar";
export type { MemberUsageBarProps } from "./MemberUsageBar";
export { default as FilterSelect } from "./FilterSelect";
export type { FilterSelectProps } from "./FilterSelect";
export { default as Notice } from "./Notice";
export { default as MailTemplate } from "./MailTemplate";
export type { MailTemplateProps, MailTemplateAction } from "./MailTemplate";
export type { NoticeProps, NoticeTone, NoticeVariant } from "./Notice";
export { default as Disclosure } from "./Disclosure";
export type { DisclosureProps, DisclosureSize } from "./Disclosure";
export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateSize } from "./EmptyState";
export { default as ExtensionPanel } from "./ExtensionPanel";
export type { ExtensionPanelProps } from "./ExtensionPanel";
export { default as Modal } from "./Modal";
export type { ModalProps, ModalSize } from "./Modal";
export { default as ConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps, ConfirmDialogTone, ConfirmDialogOutcome } from "./ConfirmDialog";
export { default as Select } from "./Select";
export type { SelectProps, SelectSize, SelectOption } from "./Select";
export { default as Tabs } from "./Tabs";
export type { TabsProps, TabsVariant, TabsSize, TabsItem } from "./Tabs";
export { default as TextField } from "./TextField";
export type { TextFieldProps, TextFieldSize } from "./TextField";
export { default as Tooltip } from "./Tooltip";
export type { TooltipProps, TooltipPlacement } from "./Tooltip";
export { default as Switch } from "./Switch";
export type { SwitchProps, SwitchSize } from "./Switch";
export { default as Slider } from "./Slider";
export type { SliderProps } from "./Slider";
export { default as ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps, ThemeMode } from "./ThemeToggle";

// Chrome — 대시보드 쉘
export { default as SummaryBanner } from "./SummaryBanner";
/** @deprecated Use SummaryBanner */ export { default as AiSummaryBanner } from "./SummaryBanner";
export type { AiSummaryBannerProps, AiSummaryBannerTone } from "./SummaryBanner";
export { default as AiSymbol } from "./widget/AiSymbol";
export { default as TriggerButton } from "./widget/TriggerButton";
/** @deprecated Use TriggerButton */ export { default as AiTriggerButton } from "./widget/TriggerButton";
export type { AiTriggerButtonProps } from "./widget/TriggerButton";
export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonTone } from "./Button";
export { default as WebCtaButton } from "./WebCtaButton";
export type { WebCtaButtonProps, WebCtaVariant, WebCtaSize, WebCtaRounded, WebCtaWidth } from "./WebCtaButton";
export { default as WebDateLabel } from "./WebDateLabel";
export type { WebDateLabelProps, WebDateLabelSize } from "./WebDateLabel";
export { default as WebBreadcrumb } from "./WebBreadcrumb";
export type { WebBreadcrumbProps, WebBreadcrumbItem } from "./WebBreadcrumb";
export { default as WebSearchField } from "./WebSearchField";
export type { WebSearchFieldProps, WebSearchFieldSize } from "./WebSearchField";
export { default as FilterBar } from "./FilterBar";
export type { FilterBarProps, FilterBarDropdownConfig, FilterBarSize } from "./FilterBar";
export { default as DashboardBuildingProgress } from "./DashboardBuildingProgress";
export type { DashboardBuildingProgressProps } from "./DashboardBuildingProgress";
export { default as DashboardLayout } from "./DashboardLayout";
export { default as DataTable } from "./DataTable";
export type { DataTableColumn, DataTableProps, DataTableSort } from "./DataTable";
export { default as Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";
export { default as EventWeekTimeMatrix } from "./EventWeekTimeMatrix";
export type { EventWeekTimeMatrixProps } from "./EventWeekTimeMatrix";
export { default as LiveTimerCompact } from "./LiveTimerCompact";
export type { LiveTimerCompactSize } from "./LiveTimerCompact";
export { default as GpuStatusBar } from "./GpuStatusBar";
export type { GpuStatusBarProps, GpuStatusCategory, GpuStatusSegment } from "./GpuStatusBar";
export { default as HexGrid, HEX_GRID_LEGEND } from "./HexGrid";
export type { HexGridProps, HexItem, HexTone } from "./HexGrid";
export { default as KpiCard } from "./KpiCard";
export type { KpiCardProps } from "./KpiCard";
export { default as MiniBarChart } from "./MiniBarChart";
export type { MiniBarChartProps, MiniBarChartSeries } from "./MiniBarChart";
export { default as ApdexChart } from "./ApdexChart";
export type { ApdexChartProps } from "./ApdexChart";
export { default as BarList } from "./BarList";
export type { BarListProps, BarListRow } from "./BarList";
export { default as ActiveTransactionArc, SPEED_LEGEND } from "./ActiveTransactionArc";
export type { ActiveTransactionArcProps } from "./ActiveTransactionArc";
export { default as ScatterHeatmap, SCATTER_HEATMAP_DEMO_DOTS } from "./ScatterHeatmap";
export type { ScatterHeatmapProps, ScatterDot } from "./ScatterHeatmap";
export { default as MiniDonutChart } from "./MiniDonutChart";
export type { MiniDonutChartProps, DonutSegment } from "./MiniDonutChart";
export { default as MiniLineChart } from "./MiniLineChart";
export { default as MiniMultiLineChart } from "./MiniMultiLineChart";
export type {
  MiniMultiLineChartProps,
  MiniMultiLineChartSeries,
} from "./MiniMultiLineChart";
export { default as OptionbarInstanceSelector } from "./OptionbarInstanceSelector";
export type { InstanceStatus, OptionbarInstanceSelectorSize } from "./OptionbarInstanceSelector";
export { default as OptionbarItem } from "./OptionbarItem";
export type { OptionbarSize } from "./OptionbarItem";
export { default as OptionbarPage } from "./OptionbarPage";
export type { OptionbarField } from "./OptionbarPage";
export { default as OptionbarValueDisplay } from "./OptionbarValueDisplay";
export type { OptionbarValueDisplaySize, OptionbarValueDisplayVariant } from "./OptionbarValueDisplay";
export { default as LandingHeader } from "./LandingHeader";
export type { LandingHeaderProps, LandingHeaderNavItem, LandingHeaderAction } from "./LandingHeader";
export { default as PageHeader } from "./PageHeader";
export type { ProfileMenuItem, NotificationItem } from "./PageHeader";
export { default as PageHeaderAiInline } from "./PageHeaderAiInline";
export type { PageHeaderAiInlineProps } from "./PageHeaderAiInline";
export { default as PresetSelect } from "./PresetSelect";
export type { PresetSelectSize } from "./PresetSelect";
export { default as Sidebar, K8S_GPU_MENU } from "./Sidebar";
export type { MenuItem, ProjectContext, OrgContext } from "./Sidebar";
export { default as HeaderPillButton } from "./HeaderPillButton";
export type { HeaderPillButtonSize } from "./HeaderPillButton";
export { default as ToolbarIconButton, ToolbarIcon } from "./ToolbarIconButton";
export type { ToolbarIconButtonProps } from "./ToolbarIconButton";
export { IcDocs, IcSupport } from "./icons/HeaderIcons";
export { IcSnapshot } from "./icons/SnapshotIcon";
export { default as SidebarLogoHeader } from "./SidebarLogoHeader";
export { default as SidebarMenuItem } from "./SidebarMenuItem";
export { default as SidebarOrgSwitcher } from "./SidebarOrgSwitcher";
export { default as SidebarProjectSwitcher } from "./SidebarProjectSwitcher";
export { default as SidebarCopyright } from "./SidebarCopyright";
export { default as DateTimeBlock } from "./DateTimeBlock";
export type { DateParts } from "./DateTimeBlock";
export { default as Stage } from "./Stage";
export { default as SubHeaderBar } from "./SubHeaderBar";
export type { SubHeaderBarProps } from "./SubHeaderBar";
export { default as TimeRangeSelector } from "./TimeRangeSelector";
export { default as Toast } from "./Toast";
export type { ToastVariant } from "./Toast";

// Widget shell + context
export { default as WhaTapAiWidget } from "./WhaTapAiWidget";
export { default as WidgetShell } from "./WidgetShell";
/** @deprecated Use WidgetShell */ export { default as AiWidget } from "./WidgetShell";
export { WhaTapAiProvider, useWhaTapAi } from "./widget/WhaTapAiContext";
export type { LastPrompt } from "./widget/WhaTapAiContext";
export type { WidgetAction } from "./WhaTapAiWidget";

// Policy
export { default as DsReadOnlyNotice } from "./DsReadOnlyNotice";
export type { DsReadOnlyNoticeProps } from "./DsReadOnlyNotice";

// Parts — 인라인 구조 추출 컴포넌트 (구조 인라인 금지 정책). 부모 카탈로그의 Chrome/Parts·WhaTap AI/Parts.
//   Chrome parts
export { default as PageHeaderNotificationItem } from "./PageHeaderNotificationItem";
export { default as PageHeaderProfileMenuItem } from "./PageHeaderProfileMenuItem";
export { default as DataTableRow } from "./DataTableRow";
export { default as FilterDropdownOptionItem } from "./FilterDropdownOptionItem";
export { default as TabButton } from "./TabButton";
export { default as ProductRailItem } from "./ProductRailItem";
export { default as BottomRailItem } from "./BottomRailItem";
export { default as FilterChipItem } from "./FilterChipItem";
export { default as QuickActionChip } from "./widget/QuickActionChip";
/** @deprecated Use QuickActionChip */ export { default as AiQuickActionChip } from "./widget/QuickActionChip";
//   Widget parts (src/widget)
export { default as CostBreakdownRow } from "./widget/CostBreakdownRow";
export { default as ClassificationTableRow } from "./widget/ClassificationTableRow";
export { default as CostTableRow } from "./widget/CostTableRow";
export { default as MigPlanRow } from "./widget/MigPlanRow";
export { default as EventListItem } from "./widget/EventListItem";
export { default as ReasoningStep } from "./widget/ReasoningStep";
export { default as TimelineStepItem } from "./widget/TimelineStepItem";
export { default as ReceiverChannelItem } from "./widget/ReceiverChannelItem";
export { default as CriteriaGroup } from "./widget/CriteriaGroup";
export { default as CriteriaOptionButton } from "./widget/CriteriaOptionButton";
export { default as ProposalSection } from "./widget/ProposalSection";
export { default as ActionChip } from "./widget/ActionChip";
/** @deprecated Use ActionChip */ export { default as AiActionChip } from "./widget/ActionChip";
export { default as AttachmentChip } from "./widget/AttachmentChip";
/** @deprecated Use AttachmentChip */ export { default as AiAttachmentChip } from "./widget/AttachmentChip";

// Topology — 노드-엣지 그래프(레이아웃 엔진 + 프리미티브)
export * from "./topology";

// Icons
export { default as SettingsIcon } from "./icons/SettingsIcon";

// Widget tokens / primitives / message cards
export * from "./widget";

/** 개발 전용 정책 가드 — 위반 요소에 outline·배지 표시. 프로덕션에서는 호출하지 않으면 된다. */
export { enableDsPolicyGuard } from "./devPolicyGuard";
export type { DsPolicyRule, DsPolicyGuardOptions } from "./devPolicyGuard";
