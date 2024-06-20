import { useParams } from 'react-router-dom';
import WidgetCore from './WidgetCore';

const Widget = () => {
    const { company_slug } = useParams();

    return <WidgetCore companySlug={company_slug} />;
};

export default Widget;
