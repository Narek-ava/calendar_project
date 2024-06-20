import { IService } from '../../../models/IService';
import { ILocation } from '../../../models/ILocation';
import { IEmployee } from '../../../models/IEmployee';
import { TablerIcon } from '@tabler/icons';
import { FileAttachmentProps, UploadableFile } from '../../../ui-component/file-uploader-preview/AttachmentsUpload';
import { IWidgetCompany } from '../../../models/ICompany';
// import { IServiceCategory } from '../../../models/IServiceCategory';

interface StepData {
    index: number;
    title: string;
    icon: TablerIcon;
}

export interface Steps {
    service: StepData;
    location: StepData;
    provider: StepData;
    date: StepData;
    user: StepData;
    payment?: StepData;
    final: StepData;
}

export interface WizardStates {
    step: number;
    serviceData: IService | null;
    setServiceData: (d: WizardStates['serviceData']) => void;
    locationData: ILocation | null;
    setLocationData: (d: WizardStates['locationData']) => void;
    providerData: IEmployee | null;
    setProviderData: (d: WizardStates['providerData']) => void;
    dateData: TimeSlot | null;
    setDateData: (d: WizardStates['dateData']) => void;
    userData: IWidgetUser | null;
    setUserData: (d: WizardStates['userData']) => void;
}

export interface StepContentProps extends WizardStates {
    company_slug: string;
    step: WizardStates['step'];
    addProgress: (d: WizardStates['step']) => void;
    substituteProgress: (d: WizardStates['step']) => void;
    errorIndex: number | null;
    setErrorIndex: (i: number | null) => void;
    handleNext: () => void;
    handleBack: () => void;
    // categories: IServiceCategory[];
    services: IService[] | null;
    attachments: UploadableFile[];
    setAttachments: (data: UploadableFile[]) => void;
    attachmentsIdsToDelete: (number | string)[];
    setAttachmentsIdsToDelete: (data: (number | string)[]) => void;
    isAnyProvider: boolean;
    setIsAnyProvider: (data: boolean) => void;
    isMobile: boolean;
    submitBooking: (paymentDetails?: object | null, user?: WizardStates['userData']) => void;
    resetWidget: () => void;
    rawResetWidget: () => void;
    submitted: boolean;
    data: IWidgetCompany;
    matchDownMd: boolean;
    setHideNav: (hide: boolean) => void;
    timezone: string;
    setTimezone: (timezone: string) => void;
}

export interface IWidgetUser {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    note?: string | null;
}

// Widget Form Props
interface BaseFormProps {
    step: WizardStates['step'];
    addProgress: (d: WizardStates['step']) => void;
    substituteProgress: (d: WizardStates['step']) => void;
    handleNext: StepContentProps['handleNext'];
}

export interface ServiceFormProps extends BaseFormProps {
    serviceData: WizardStates['serviceData'];
    setServiceData: WizardStates['setServiceData'];
    setLocationData: WizardStates['setLocationData'];
    setProviderData: WizardStates['setProviderData'];
    setDateData: WizardStates['setDateData'];
    // categories: StepContentProps['categories'];
    services: IService[] | null;
    handleBack: () => void;
    matchDownMd: boolean;
    setHideNav: (hide: boolean) => void;
    submitted: boolean;
}

export interface LocationFormProps extends BaseFormProps {
    serviceData: WizardStates['serviceData'];
    locationData: WizardStates['locationData'];
    setLocationData: WizardStates['setLocationData'];
    setProviderData: WizardStates['setProviderData'];
    setDateData: WizardStates['setDateData'];
    setErrorIndex: StepContentProps['setErrorIndex'];
    handleBack: () => void;
    filteredLocations?: ILocation[];
    submitted: boolean;
}

export interface ProviderFormProps extends BaseFormProps {
    company_slug: StepContentProps['company_slug'];
    serviceData: WizardStates['serviceData'];
    locationData: WizardStates['locationData'];
    providerData: WizardStates['providerData'];
    setProviderData: WizardStates['setProviderData'];
    setDateData: WizardStates['setDateData'];
    setErrorIndex: StepContentProps['setErrorIndex'];
    isAnyProvider: StepContentProps['isAnyProvider'];
    setIsAnyProvider: StepContentProps['setIsAnyProvider'];
    handleBack: () => void;
    filteredEmployees?: IEmployee[];
    submitted: boolean;
}

export interface DateFormProps extends BaseFormProps {
    company: IWidgetCompany;
    serviceData: WizardStates['serviceData'];
    locationData: WizardStates['locationData'];
    providerData: WizardStates['providerData'];
    setProviderData: WizardStates['setProviderData'];
    errorIndex: StepContentProps['errorIndex'];
    dateData: WizardStates['dateData'];
    setDateData: WizardStates['setDateData'];
    isAnyProvider: StepContentProps['isAnyProvider'];
    setIsAnyProvider: StepContentProps['setIsAnyProvider'];
    handleBack: () => void;
    submitted: boolean;
    timezone: string;
    setTimezone: (timezone: string) => void;
}

export interface UserFormProps extends BaseFormProps {
    userData: WizardStates['userData'];
    setUserData: WizardStates['setUserData'];
    attachments: StepContentProps['attachments'];
    setAttachments: StepContentProps['setAttachments'];
    attachmentsIdsToDelete: StepContentProps['attachmentsIdsToDelete'];
    setAttachmentsIdsToDelete: FileAttachmentProps['setAttachmentsIdsToDelete'];
    isMobile: StepContentProps['isMobile'];
    handleBack: () => void;
    submitted: boolean;
    company: IWidgetCompany;
    service: WizardStates['serviceData'];
    submitBooking: (paymentDetails?: object | null, user?: WizardStates['userData']) => void;
}

export interface PaymentFormProps extends BaseFormProps {
    service: WizardStates['serviceData'];
    submitted: boolean;
    handleBack: () => void;
    company: IWidgetCompany;
    date: WizardStates['dateData'];
    submitBooking: (paymentDetails?: object | null, user?: WizardStates['userData']) => void;
    location: WizardStates['locationData'];
}

// others
export interface WidgetArrowProps {
    step: WizardStates['step'];
    stepsProgress: WidgetSummaryProps['stepsProgress'];
    handleBack: StepContentProps['handleBack'];
    setErrorIndex: StepContentProps['setErrorIndex'];
    matchDownMd: WidgetSummaryProps['matchDownMd'];
}

export interface TimeSlot {
    start_at: string;
    end_at: string;
    occupied: boolean;
    employee: {
        id: number;
        profession_title: string;
        user: {
            firstname: string;
            lastname: string;
            id: number;
        };
    };
}

export interface WidgetSummaryProps {
    isInProgress?: boolean;
    step: WizardStates['step'];
    stepsProgress: number[];
    setActiveStep: (d: number) => void;
    serviceData: WizardStates['serviceData'];
    locationData: WizardStates['locationData'];
    providerData: WizardStates['providerData'];
    dateData: WizardStates['dateData'];
    userData: WizardStates['userData'];
    attachments: StepContentProps['attachments'];
    setAttachments: StepContentProps['setAttachments'];
    handleBack: StepContentProps['handleBack'];
    resetWidget: () => void;
    rawResetWidget: () => void;
    submitted: boolean;
    submitBooking: (paymentDetails?: object | null, user?: WizardStates['userData']) => void;
    attachmentsIdsToDelete: StepContentProps['attachmentsIdsToDelete'];
    isAnyProvider: StepContentProps['isAnyProvider'];
    matchDownMd: boolean;
    prepopulatedLocation: WizardStates['locationData'];
    prepopulatedProvider: WizardStates['providerData'];
    hideNav?: boolean;
    company: IWidgetCompany;
    timezone: string;
}

// service
export interface GetEmployeeParams {
    slug: string;
    service: IService['id'];
    location: ILocation['id'];
}

export interface GetTimeSlotsParams extends GetEmployeeParams {
    date: string;
    employee?: IEmployee['id'];
}

export interface BookingData {
    user: IWidgetUser;
    employee_id?: IEmployee['id'];
    location_id: ILocation['id'];
    service_id: IService['id'];
    start_at: TimeSlot['start_at'];
    end_at: TimeSlot['end_at'];
    images?: string[];
    note?: string | null;
    payment_details?: object;
    time_zone?: string;
}

export interface CreateBookingParams {
    slug: string;
    data: BookingData;
}

export interface IWidgetDeposit {
    required: boolean;
    amount: number | null;
}
