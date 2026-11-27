import { landingListNativeSource } from '../src/catalog/landing-list-native';
import { landingCardNativeSource } from '../src/catalog/landing-card-native';
import { portalShellNativeSource } from '../src/catalog/portal-shell-native';
import { dashboardNativeSource } from '../src/catalog/dashboard-native';
import { portalHeaderNativeSource } from '../src/catalog/portal-header-native';
import { portalLogoNativeSource } from '../src/catalog/portal-logo-native';
import { mobilePageNativeSource } from '../src/catalog/mobile-page-native';
import { cardStackNativeSource } from '../src/catalog/card-stack-native';
import type { NativePlatformChoice } from '../src/catalog/native-export';
import { iconSurfaceNativeSource } from '../src/catalog/icon-surface-native';
import { infoRowNativeSource } from '../src/catalog/info-row-native';
import { downloadNativeSource } from '../src/catalog/download-native';
import { consentNativeSource } from '../src/catalog/consent-native';
import { primitiveNativeSource } from '../src/catalog/primitives-native';
import { utilityBarNativeSource } from '../src/catalog/utility-bar-native';
import { footerNativeSource } from '../src/catalog/footer-native';
import { serviceCatalogNativeSource } from '../src/catalog/service-catalog-native';
import { panelPartNativeSource } from '../src/catalog/panel-part-native';
import { portalNoticeNativeSource } from '../src/catalog/portal-notice-native';
import { formFieldNativeSource } from '../src/catalog/form-field-native';
import { fieldCopyNativeSource } from '../src/catalog/field-copy-native';
import { chatNativeSource } from '../src/catalog/chat-native';
import { richTextNativeSource } from '../src/catalog/rich-text-native';
import { codeNativeSource } from '../src/catalog/code-native';
import { sidebarNativeSource } from '../src/catalog/sidebar-native';
import { messageNativeSource } from '../src/catalog/message-native';
import { sectionHeadingNativeSource } from '../src/catalog/section-heading-native';
import { headerNativeSource } from '../src/catalog/header-native';
import { timelineNativeSource } from '../src/catalog/timeline-native';
import { documentNativeSource } from '../src/catalog/document-native';
import { rowNativeSource } from '../src/catalog/row-native';
import { tooltipNativeSource } from '../src/catalog/tooltip-native';
import { filterNativeSource } from '../src/catalog/filter-native';
import { phoneNativeSource } from '../src/catalog/phone-native';
import { filePickerNativeSource } from '../src/catalog/file-picker-native';
import { badgeNativeSource } from '../src/catalog/badge-native';
import { buttonNativeSource } from '../src/catalog/button-native';
import { emptyStateNativeSource } from '../src/catalog/empty-state-native';
import { skeletonNativeSource } from '../src/catalog/skeleton-native';
import { linkNativeSource } from '../src/catalog/link-native';
import { progressNativeSource } from '../src/catalog/progress-native';
import { switchNativeSource } from '../src/catalog/switch-native';
import { timeNativeSource } from '../src/catalog/time-native';
import { pinNativeSource } from '../src/catalog/pin-native';
import { snackbarProviderNativeSource } from '../src/catalog/snackbar-provider-native';
import { snackbarNativeSource } from '../src/catalog/snackbar-native';
import { dataTableNativeSource } from '../src/catalog/data-table-native';
import { carouselNativeSource } from '../src/catalog/carousel-native';
import { calendarNativeSource } from '../src/catalog/calendar-native';
import { menuNativeSource } from '../src/catalog/menu-native';
import { paginationNativeSource } from '../src/catalog/pagination-native';
import { textInputNativeSource } from '../src/catalog/text-input-native';
import { choiceNativeSource } from '../src/catalog/choice-native';
import { panelNativeSource } from '../src/catalog/panel-native';
import { dialogNativeSource } from '../src/catalog/dialog-native';
import { tabsNativeSource } from '../src/catalog/tabs-native';
import { accordionNativeSource } from '../src/catalog/accordion-native';
import type { AccordionProps } from '../src/kit/components';
import type { LandingFAQProps } from '../src/kit/landing/content';
import type { Preview } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';
import { NativePreview } from '../src/catalog/NativePreview';
import { nativePreviewPlatform, normalizeNativePlatformChoice } from '../src/catalog/native-export';
import { cardListNativeSource } from '../src/catalog/card-list-native';
import { selectNativeSource } from '../src/catalog/select-native';
import { bottomNavigationNativeSource } from '../src/catalog/bottom-navigation-native';
import type { NavigationItem } from '../src/kit/patterns';
import type { CardListProps } from '../src/kit/mobile/index';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { DocumentationContainer } from './DocumentationContainer';
import '../src/kit/tokens.css';
import '../src/kit/components.css';
import '../src/kit/mobile/mobile.css';
import '../src/kit/portal/shell.css';
import '../src/kit/portal/portal.css';
import '../src/kit/landing/landing.css';
import './preview.css';

const preview: Preview = {
  initialGlobals: {
    componentTheme: 'light',
    corePlatform: 'web',
    nativePlatform: 'auto',
    viewport: { value: 'responsive' },
    backgrounds: { value: 'light' },
  },
  globalTypes: {
    nativePlatform: {
      name: 'System podglądu React Native',
      description: 'Auto wykrywa Androida w przeglądarce. iOS i Android pozwalają wymusić podgląd.',
      toolbar: {
        icon: 'mobile',
        dynamicTitle: true,
        items: [
          { value: 'auto', title: 'System: Auto' },
          { value: 'ios', title: 'System: iOS' },
          { value: 'android', title: 'System: Android' },
        ],
      },
    },
    componentTheme: {
      name: 'Motyw komponentu',
      description:
        'Motyw podglądu, niezależny od dokumentacji. Landing korzysta z własnej jasnej palety.',
      toolbar: {
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Jasny komponent' },
          { value: 'dark', title: 'Ciemny komponent' },
        ],
      },
    },
    corePlatform: {
      name: 'Kontekst wspólnych komponentów',
      description: 'Geometria komponentów z działu Wspólne.',
      toolbar: {
        icon: 'browser',
        dynamicTitle: true,
        items: [
          { value: 'web', title: 'Wspólne: desktop' },
          { value: 'mobile', title: 'Wspólne: mobile' },
        ],
      },
    },
  },
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    docs: { container: DocumentationContainer, codePanel: true, source: { type: 'dynamic' } },
    backgrounds: {
      options: {
        light: { name: 'Jasne tło', value: '#f4f6fb' },
        white: { name: 'Białe tło', value: '#ffffff' },
        dark: { name: 'Ciemne tło', value: '#101317' },
      },
    },
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        mobile375: {
          name: 'Mobile · 375 × 812',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        mobile320: {
          name: 'Mobile · 320 × 740',
          styles: { width: '320px', height: '740px' },
          type: 'mobile',
        },
        desktop1280: {
          name: 'Desktop · 1280 × 900',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
        desktop1440: {
          name: 'Desktop · 1440 × 1000',
          styles: { width: '1440px', height: '1000px' },
          type: 'desktop',
        },
      },
    },
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } },
    },
    options: {
      storySort: {
        order: [
          'Start',
          'Fundamenty',
          'Wspólne',
          'Mobile',
          'Desktop',
          'Landing',
          'Przykładowe ekrany',
        ],
      },
    },
  },
  decorators: [
    function NativeStoryDecorator(Story, context) {
      const [globals, updateGlobals] = useGlobals();
      const { category, name } = context.parameters.mdesign ?? {};
      const choice = normalizeNativePlatformChoice(globals.nativePlatform);
      const cardList = name === 'CardList';
      const preset = cardList && choice === 'auto' ? context.args.platform : undefined;
      const itemPlatform = preset === 'ios' || preset === 'android' ? preset : undefined;
      const args = cardList
        ? { ...context.args, platform: itemPlatform ?? nativePreviewPlatform(choice) }
        : context.args;
      const story = <Story args={args} />;
      let source:
        ((choice: NativePlatformChoice, root: HTMLElement) => string | Promise<string>) | undefined;
      if (Array.isArray(args.items)) {
        if (cardList) {
          source = () =>
            cardListNativeSource(
              args.items as CardListProps['items'],
              itemPlatform ?? (choice === 'auto' ? undefined : choice),
            );
        } else if (name === 'BottomNavigation') {
          source = () =>
            bottomNavigationNativeSource(
              args.items as NavigationItem[],
              String(args.value ?? ''),
              String(args.label ?? 'Nawigacja główna'),
              choice,
            );
        }
      }
      if (
        ['Select', 'PortalSelect', 'MobileDropdown', 'LandingCombobox'].includes(name) &&
        Array.isArray(args.options)
      ) {
        source = () =>
          selectNativeSource(
            {
              placeholder: name === 'LandingCombobox' ? 'Wszystkie' : undefined,
              ...args,
              label: String(args.label ?? 'Wybierz'),
              options: args.options,
            },
            choice,
          );
      }
      if ((name === 'Accordion' || name === 'LandingFAQ') && Array.isArray(args.items)) {
        source = () =>
          accordionNativeSource(
            args as AccordionProps | LandingFAQProps,
            name === 'LandingFAQ',
            choice,
          );
      }
      if (
        (name === 'Tabs' || name === 'LandingTabs' || name === 'SegmentedControl') &&
        Array.isArray(args.items)
      ) {
        source = () =>
          tabsNativeSource({ ...args, items: args.items }, name === 'SegmentedControl', choice);
      }
      if (name === 'SnackbarProvider' || name === 'PortalSnackbarProvider') {
        source = () =>
          snackbarProviderNativeSource(args, name === 'PortalSnackbarProvider', choice);
      }
      if (name === 'MobileSnackbar' || name === 'PortalSnackbar' || name === 'MobileBanner') {
        source = () => snackbarNativeSource(name, args, choice);
      }
      if (name === 'LandingCookieConsent') source = () => consentNativeSource(args, choice);
      if (name === 'LandingDownloadCTA' || name === 'LandingDownloadPanel')
        source = () => downloadNativeSource(name, args, choice);
      if (name === 'InfoRow')
        source = () =>
          infoRowNativeSource(
            [args as Parameters<typeof infoRowNativeSource>[0][number]],
            false,
            choice,
          );
      if (name === 'InfoRowList' && Array.isArray(args.items))
        source = () => infoRowNativeSource(args.items, true, choice);
      if (name === 'IconSurface')
        source = (_, root) => iconSurfaceNativeSource(root, args.label, args.disabled);
      if (name === 'CardStack') source = () => cardStackNativeSource(args, choice);
      if (['IconPage', 'IllustrationPage', 'ServiceWelcomePage', 'SupportPage'].includes(name))
        source = (_, root) => mobilePageNativeSource(root, name, args, choice);
      if (name === 'PortalLogoInformation')
        source = (_, root) => portalLogoNativeSource(root, args.label, args.alt);
      if (name === 'PortalHeader')
        source = (_, root) => portalHeaderNativeSource(root, args, choice);
      if (name === 'PortalDashboard') source = () => dashboardNativeSource(args, choice);
      if (name === 'PortalShell' && Array.isArray(args.navigation))
        source = () =>
          portalShellNativeSource(
            args as unknown as Parameters<typeof portalShellNativeSource>[0],
            choice,
          );
      if (
        [
          'LandingCatalogCard',
          'LandingNewsCard',
          'LandingPressCard',
          'LandingServiceCard',
        ].includes(name)
      )
        source = (_, root) => landingCardNativeSource(root, name, args, choice);
      if (
        (name === 'LandingCatalogListing' || name === 'LandingNewsList') &&
        Array.isArray(args.items)
      )
        source = () => landingListNativeSource(name, { ...args, items: args.items }, choice);
      if (typeof name === 'string' && !source) {
        const dialog = dialogNativeSource(name, args, choice);
        if (dialog) source = () => dialog;
      }
      if (
        ['Card', 'PortalCard', 'PortalPanel', 'MobileContentBox', 'PortalDashboardTile'].includes(
          name,
        )
      ) {
        source = () =>
          panelNativeSource(
            name === 'PortalDashboardTile'
              ? { ...args, footer: args.action, action: undefined }
              : args,
            choice,
          );
      }
      if (['Checkbox', 'Radio', 'CheckboxGroup', 'RadioGroup', 'PortalRadioGroup'].includes(name)) {
        source = () => choiceNativeSource(args, name.startsWith('Checkbox'), choice);
      }
      if (
        [
          'SearchField',
          'LandingSearchField',
          'TextField',
          'TextArea',
          'MobileTextArea',
          'MaskedField',
        ].includes(name)
      ) {
        source = () => textInputNativeSource(name, args, choice);
      }
      if (
        ['Progress', 'PortalProgress', 'Spinner', 'PortalLoader', 'LandingLoader'].includes(name)
      ) {
        source = () => progressNativeSource(name, args, choice);
      }
      if (
        [
          'MobileLink',
          'LandingLink',
          'PortalExternalLink',
          'PortalServiceLinks',
          'Breadcrumbs',
          'LandingBreadcrumbs',
          'PortalBreadcrumbs',
        ].includes(name)
      ) {
        source = () => linkNativeSource(name, args, choice);
      }
      if (name === 'Switch' || name === 'MobileSwitch') {
        source = () => switchNativeSource(args, choice);
      }
      if (name === 'InputDateTime') {
        source = () =>
          args.type === 'time'
            ? timeNativeSource({ ...args, triggerOnly: true }, choice)
            : calendarNativeSource(
                'MobileDatePicker',
                { ...args, triggerOnly: true, placeholder: 'DD.MM.RRRR' },
                choice,
              );
      }
      if (name === 'MobileTimePicker') {
        source = () => timeNativeSource(args, choice);
      }
      if (['Button', 'IconButton', 'MobileTextButton', 'LandingButton'].includes(name)) {
        source = () => buttonNativeSource(name, args, choice);
      }
      if (['Badge', 'MobileStatusBadge', 'NotificationBadge', 'PortalChip'].includes(name)) {
        source = () => badgeNativeSource(name, args, choice);
      }
      if (['MobileFilePicker', 'PortalFileUpload', 'FileSourceItem'].includes(name)) {
        source = () => filePickerNativeSource(name, args, choice);
      }
      if (name === 'Tooltip' || name === 'LandingTooltip' || name === 'PortalInfoTip') {
        source = () => tooltipNativeSource(name, args, choice);
      }
      if (
        [
          'ListRow',
          'NativeSingleCard',
          'ShortcutTile',
          'SmallServiceCard',
          'DocumentRow',
          'ServiceTile',
        ].includes(name)
      ) {
        source = () => rowNativeSource(name, args, choice);
      }
      if (name === 'DocumentArtwork' || name === 'DocumentCard' || name === 'DocumentTile') {
        source = () => documentNativeSource(name, args, choice);
      }
      if (name === 'Timeline' || name === 'BulletPoint') {
        source = () => timelineNativeSource(name, args, choice);
      }
      if (name === 'AppHeader' || name === 'MobileTopAppBar') {
        source = () => headerNativeSource(name, args, choice);
      }
      if (
        name === 'ListHeader' ||
        name === 'SectionHeader' ||
        name === 'MobileHeader' ||
        name === 'PortalPageTitle'
      ) {
        source = () => sectionHeadingNativeSource(name, args, choice);
      }
      if (name === 'Alert' || name === 'PortalMessage' || name === 'MobileAnnouncement') {
        source = () => messageNativeSource(name, args, choice);
      }
      if (
        (name === 'Sidebar' || name === 'PortalSidebar' || name === 'LandingHeader') &&
        Array.isArray(args.items)
      ) {
        source = () => sidebarNativeSource(name, { ...args, items: args.items }, choice);
      }
      if (['QRCodeCard', 'QRCodeGraphic', 'BarcodeCard', 'BarcodeGraphic'].includes(name)) {
        source = () => codeNativeSource(name, args, choice);
      }
      if (name === 'RichText' && Array.isArray(args.segments)) {
        source = () => richTextNativeSource(args.segments, choice);
      }
      if (name === 'ChatBubble' || name === 'TypingIndicator') {
        source = () => chatNativeSource(name, args, choice);
      }
      if (
        [
          'FieldError',
          'FieldHelper',
          'PortalFormLabel',
          'PortalFormHelperText',
          'PortalFormMessage',
          'PortalCharacterCounter',
          'PortalStatusText',
        ].includes(name)
      ) {
        source = () => fieldCopyNativeSource(name, args, choice);
      }
      if (name === 'PortalFormField') {
        source = () => formFieldNativeSource(args, choice);
      }
      if (name === 'PortalBanner' || name === 'PortalErrorView') {
        source = () => portalNoticeNativeSource(name, args, choice);
      }
      if (
        typeof name === 'string' &&
        /^Portal(?:Card|Panel)(?:Header|Content|Footer)$/.test(name)
      ) {
        source = () => panelPartNativeSource(name, args.children, choice);
      }
      if (name === 'PortalServiceCatalog' && Array.isArray(args.items)) {
        source = () => serviceCatalogNativeSource({ ...args, items: args.items }, choice);
      }
      if (name === 'PortalFooter' || name === 'LandingFooter' || name === 'LandingSitemap') {
        source = () => footerNativeSource(name, args, choice);
      }
      if (name === 'LandingUtilityBar') source = () => utilityBarNativeSource(args, choice);
      if (name === 'Avatar' || name === 'Divider') {
        source = () => primitiveNativeSource(name, args, choice);
      }
      if (name === 'Skeleton') {
        source = () => skeletonNativeSource(args, choice);
      }
      if (name === 'EmptyState' || name === 'MobileEmptyState' || name === 'PortalEmptyState') {
        source = () => emptyStateNativeSource(name, args, choice);
      }
      if (name === 'FilterControl' && Array.isArray(args.items)) {
        source = () =>
          filterNativeSource(
            { ...args, items: args.items, label: String(args.label ?? 'Filtry') },
            choice,
          );
      }
      if (name === 'PhoneField') {
        source = () => phoneNativeSource(args, choice);
      }
      if (name === 'PinInput') {
        source = () => pinNativeSource(args, choice);
      }
      if (name === 'Pagination' || name === 'PortalPagination') {
        source = () => paginationNativeSource(args, name === 'PortalPagination', choice);
      }
      if (
        ['MobileMenu', 'PortalMenu', 'PortalAccountMenu'].includes(name) &&
        Array.isArray(args.items)
      ) {
        source = () => menuNativeSource({ ...args, items: args.items }, choice);
      }
      if (
        name === 'MobileCalendar' ||
        name === 'MobileDatePicker' ||
        name === 'PortalCalendar' ||
        name === 'PortalDatePicker'
      ) {
        source = () => calendarNativeSource(name, args, choice);
      }
      if (['Pager', 'Onboarding', 'PageIndicator', 'LandingDocumentCarousel'].includes(name)) {
        source = () => carouselNativeSource(name, args, choice);
      }
      if (name === 'PortalDataTable' && Array.isArray(args.rows) && Array.isArray(args.columns)) {
        source = () =>
          dataTableNativeSource(
            {
              ...args,
              caption: String(args.caption ?? 'Tabela danych'),
              rows: args.rows,
              columns: args.columns,
              rowKey: args.rowKey,
            },
            choice,
          );
      }
      const platform =
        category === 'mobile'
          ? 'mobile'
          : category === 'landing'
            ? 'landing'
            : category === 'core'
              ? context.globals.corePlatform
              : 'web';
      const theme = context.globals.componentTheme === 'dark' ? 'dark' : 'light';
      return (
        <div
          className="md-story-surface"
          data-platform={platform}
          data-theme={theme}
          data-story-category={category ?? 'docs'}
        >
          {name ? (
            <NativePreview
              choice={choice}
              onChoiceChange={(next) => updateGlobals({ nativePlatform: next })}
              source={source}
            >
              {story}
            </NativePreview>
          ) : (
            story
          )}
        </div>
      );
    },
  ],
};
export default preview;
