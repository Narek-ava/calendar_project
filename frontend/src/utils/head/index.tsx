import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    title: string;
    metaTags?: { name: string; value: string }[];
}

const Head: React.FC<Props> = ({ title, metaTags }) => (
    <Helmet defer={false}>
        <title>{title} Chilled Butter App</title>
        {metaTags?.map((tag) => (
            <meta key={`meta_${tag.name}`} name={tag.name} content={tag.value} />
        ))}
    </Helmet>
);
export default Head;
