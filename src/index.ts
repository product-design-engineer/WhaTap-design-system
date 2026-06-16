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
export { default as OptionbarPage } from "./OptionbarPage";
export { default as PageHeader } from "./PageHeader";
export type { ProfileMenuItem, NotificationItem } from "./PageHeader";
export { default as PageHeaderAiInline } from "./PageHeaderAiInline";
export type { PageHeaderAiInlineProps } from "./PageHeaderAiInline";
export { default as PresetSelect } from "./PresetSelect";
export { default as Sidebar, K8S_GPU_MENU } from "./Sidebar";
export type { MenuItem, ProjectContext, OrgContext } from "./Sidebar";
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

// Icons
export { default as SettingsIcon } from "./icons/SettingsIcon";

// Widget tokens / primitives / message cards
export * from "./widget";
