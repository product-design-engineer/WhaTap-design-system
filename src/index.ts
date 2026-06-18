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
export { default as Checkbox } from "./Checkbox";
export type { CheckboxProps, CheckboxSize } from "./Checkbox";
export { default as Chip } from "./Chip";
export type { ChipProps, ChipVariant, ChipTone, ChipSize } from "./Chip";
export { default as FilterChip } from "./FilterChip";
export type { FilterChipProps } from "./FilterChip";
export { default as FilterDropdown } from "./FilterDropdown";
export type {
  FilterDropdownProps,
  FilterDropdownOption,
  FilterDropdownPlacement,
} from "./FilterDropdown";
export { default as Modal } from "./Modal";
export type { ModalProps, ModalSize } from "./Modal";
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
export { default as ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps, ThemeMode } from "./ThemeToggle";

// Chrome — 대시보드 쉘
export { default as AiSymbol } from "./AiSymbol";
export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonTone } from "./Button";
export { default as FilterBar } from "./FilterBar";
export type { FilterBarProps, FilterBarDropdownConfig, FilterBarSize } from "./FilterBar";
export { default as DashboardBuildingProgress } from "./DashboardBuildingProgress";
export type { DashboardBuildingProgressProps } from "./DashboardBuildingProgress";
export { default as DashboardLayout } from "./DashboardLayout";
export { default as DataTable } from "./DataTable";
export type { DataTableColumn, DataTableProps } from "./DataTable";
export { default as EventWeekTimeMatrix } from "./EventWeekTimeMatrix";
export type { EventWeekTimeMatrixProps } from "./EventWeekTimeMatrix";
export { default as LiveTimerCompact } from "./LiveTimerCompact";
export { default as MiniLineChart } from "./MiniLineChart";
export { default as OptionbarInstanceSelector } from "./OptionbarInstanceSelector";
export type { InstanceStatus } from "./OptionbarInstanceSelector";
export { default as OptionbarItem } from "./OptionbarItem";
export { default as OptionbarNewVersionButton } from "./OptionbarNewVersionButton";
export { default as OptionbarPage } from "./OptionbarPage";
export { default as OptionbarValueDisplay } from "./OptionbarValueDisplay";
export { default as PageHeader } from "./PageHeader";
export type { ProfileMenuItem, NotificationItem } from "./PageHeader";
export { default as PageHeaderAiInline } from "./PageHeaderAiInline";
export type { PageHeaderAiInlineProps } from "./PageHeaderAiInline";
export { default as PresetSelect } from "./PresetSelect";
export { default as Sidebar, K8S_GPU_MENU } from "./Sidebar";
export type { MenuItem, ProjectContext, OrgContext } from "./Sidebar";
export { default as HeaderPillButton } from "./HeaderPillButton";
export { IcDocs, IcSupport } from "./icons/HeaderIcons";
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

// AI Widget shell + context
export { default as WhaTapAiWidget } from "./WhaTapAiWidget";
export { default as AiWidget } from "./AiWidget";
export { WhaTapAiProvider, useWhaTapAi } from "./WhaTapAiContext";
export type { LastPrompt } from "./WhaTapAiContext";
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
export { default as AiQuickActionChip } from "./AiQuickActionChip";
//   WhaTap AI parts (src/widget)
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
export { default as AiActionChip } from "./widget/AiActionChip";
export { default as AiAttachmentChip } from "./widget/AiAttachmentChip";

// Icons
export { default as SettingsIcon } from "./icons/SettingsIcon";

// Widget tokens / primitives / message cards
export * from "./widget";
