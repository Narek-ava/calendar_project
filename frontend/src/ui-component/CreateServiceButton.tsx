import useAuth from '../hooks/useAuth';
import CreateButton from './CreateButton';
import Can from '../utils/roles/Can';
import usePlanName from '../hooks/usePlanName';

const CreateServiceButton = () => {
    const { user } = useAuth();
    const planName = usePlanName();

    return (
        <Can I="create" a="service">
            <CreateButton
                user={user}
                maxCountReachedText={`You're on the ${planName} subscription plan. Please contact support to upgrade your plan to be able to add more staff or locations`}
                tooltipText="Add service"
                propertyName="services"
                action="/service/create"
            />
        </Can>
    );
};

export default CreateServiceButton;
