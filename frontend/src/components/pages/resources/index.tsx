
import ResourceFilterCard, {
  ResourceFilterItem,
} from '../../molecules/ResourceFilterCard/ResourceFilterCard';

const resourceTest = {
  type: 'Guide',
  tag: '5-min read',
  title: 'Understand Pelvic Health',
  file: 'https://www.figma.com/api/mcp/asset/5ed7d8bc-3ff1-4823-9e1b-434e52565ee0',
  description: 'my name is retep and i am evil',
};

const filterResources: ResourceFilterItem[] = [
  { mediaType: 'Article', topic: 'Infertility' },
  { mediaType: 'Article', topic: 'Infertility' },
  { mediaType: 'Article', topic: 'Infertility' },
  { mediaType: 'Article', topic: 'Infertility' },
  { mediaType: 'Article', topic: 'Infertility' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Book', topic: 'Period pain' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
  { mediaType: 'Paper', topic: 'Endometriosis' },
];

const Resources: React.FC = () => {
  return (
    <div className="resources">
      <ResourceFilterCard resources={filterResources} />
    </div>
  );
};

export default Resources;
