import WidgetCore from '../WidgetCore';
import { useParams } from 'react-router-dom';

const EmbeddedWidget = () => {
    const { company_slug } = useParams();

    return <WidgetCore companySlug={company_slug} useMobileStyles />;
};

export default EmbeddedWidget;
