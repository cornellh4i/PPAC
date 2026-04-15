import ResourceCard from '../../molecules/ResourceCard/ResourceCard';

const resourceTest = {
  type: 'Guide',
  tag: '5-min read',
  title: 'Understand Pelvic Health',
  file: 'https://www.figma.com/api/mcp/asset/5ed7d8bc-3ff1-4823-9e1b-434e52565ee0',
  description:
    'my name is retep and i am evil',
};

const Resources: React.FC = () => {
  return (
    <div className="resources">
      <ResourceCard {...resourceTest} />
    </div>
  );
};

export default Resources;
