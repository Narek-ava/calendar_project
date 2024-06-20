import InfoTooltip from './InfoTooltip';
import InputLabel from './extended/Form/InputLabel';
import { ReactChild } from 'react';

interface LabelWithInfoProps {
    label: string;
    infoText?: string | ReactChild;
}

const LabelWithInfo = ({ label, infoText }: LabelWithInfoProps) => (
    <InputLabel sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
        {label}
        {infoText && <InfoTooltip text={infoText} />}
    </InputLabel>
);

export default LabelWithInfo;
