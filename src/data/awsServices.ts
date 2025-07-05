export interface AWSService {
  id: string;
  name: string;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  pricingModel: string;
  integrations?: string[];
  examTips?: string[];
  limits?: string[];
  tier: 'core' | 'important' | 'supplementary';
  cloudComparisons?: {
    googleCloud?: string;
    azure?: string;
    alibabaCloud?: string;
  };
}

export const awsServicesData: Record<string, AWSService[]> = {
  compute: [
    {
      id: 'ec2',
      name: 'Amazon EC2',
      description: 'Scalable virtual servers in the cloud',
      tier: 'core',
      keyFeatures: [
        'Multiple instance types optimized for different use cases',
        'Auto Scaling groups for automatic capacity management',
        'Elastic Load Balancing integration',
        'Spot Instances for cost optimization',
        'Dedicated Hosts and Dedicated Instances',
        'Placement Groups for network performance',
        'Instance Store and EBS storage options'
      ],
      useCases: [
        'Web applications and websites',
        'High-performance computing (HPC)',
        'Machine learning training and inference',
        'Development and testing environments',
        'Disaster recovery',
        'Big data analytics'
      ],
      pricingModel: 'Pay-as-you-go: On-Demand, Reserved Instances, Spot Instances, Dedicated Hosts',
      integrations: ['VPC', 'ELB', 'Auto Scaling', 'CloudWatch', 'IAM', 'EBS', 'S3'],
      examTips: [
        'Know the difference between instance families (C5, M5, R5, etc.)',
        'Understand Spot Instance interruption handling',
        'Remember placement group types: Cluster, Partition, Spread',
        'Know when to use Dedicated Hosts vs Dedicated Instances'
      ],
      limits: [
        'Default limit: 20 On-Demand instances per region',
        'Spot Instance limits vary by instance type',
        'EBS volume limits: 5,000 volumes per region'
      ],
      cloudComparisons: {
        googleCloud: 'Google Compute Engine (GCE)',
        azure: 'Azure Virtual Machines',
        alibabaCloud: 'Elastic Compute Service (ECS)'
      }
    },
    {
      id: 'lambda',
      name: 'AWS Lambda',
      description: 'Run code without provisioning or managing servers',
      tier: 'core',
      keyFeatures: [
        'Event-driven execution',
        'Automatic scaling',
        'Built-in fault tolerance',
        'Multiple runtime support',
        'VPC connectivity',
        'Dead letter queues',
        'Provisioned concurrency'
      ],
      useCases: [
        'Real-time file processing',
        'Data transformation',
        'Backend for mobile/web applications',
        'IoT data processing',
        'Scheduled tasks',
        'API backends with API Gateway'
      ],
      pricingModel: 'Pay per request and compute time (GB-seconds)',
      integrations: ['API Gateway', 'S3', 'DynamoDB', 'SQS', 'SNS', 'CloudWatch', 'VPC'],
      examTips: [
        'Maximum execution time: 15 minutes',
        'Memory range: 128 MB to 10,240 MB',
        'Understand cold starts and how to minimize them',
        'Know Lambda@Edge for CloudFront integration'
      ],
      limits: [
        'Concurrent executions: 1,000 per region (soft limit)',
        'Function timeout: 15 minutes maximum',
        'Deployment package size: 50 MB (zipped), 250 MB (unzipped)'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Functions',
        azure: 'Azure Functions',
        alibabaCloud: 'Function Compute'
      }
    },
    {
      id: 'ecs',
      name: 'Amazon ECS',
      description: 'Fully managed container orchestration service',
      tier: 'important',
      keyFeatures: [
        'Docker container support',
        'Fargate and EC2 launch types',
        'Service discovery',
        'Load balancer integration',
        'Auto Scaling',
        'Task definitions',
        'Cluster management'
      ],
      useCases: [
        'Microservices architecture',
        'Batch processing',
        'Web applications',
        'CI/CD pipelines',
        'Machine learning workloads'
      ],
      pricingModel: 'Pay for underlying compute resources (EC2 or Fargate)',
      integrations: ['ECR', 'ELB', 'CloudWatch', 'IAM', 'VPC', 'Auto Scaling'],
      examTips: [
        'Understand difference between ECS and EKS',
        'Know Fargate vs EC2 launch types',
        'Task definitions define container configuration',
        'Services maintain desired number of tasks'
      ],
      cloudComparisons: {
        googleCloud: 'Google Kubernetes Engine (GKE) / Cloud Run',
        azure: 'Azure Container Instances / Azure Kubernetes Service',
        alibabaCloud: 'Container Service for Kubernetes (ACK)'
      }
    }
  ],
  storage: [
    {
      id: 's3',
      name: 'Amazon S3',
      description: 'Object storage built to store and retrieve any amount of data',
      tier: 'core',
      keyFeatures: [
        'Multiple storage classes',
        'Lifecycle policies',
        'Versioning',
        'Cross-region replication',
        'Server-side encryption',
        'Access control and bucket policies',
        'Event notifications'
      ],
      useCases: [
        'Static website hosting',
        'Data archiving and backup',
        'Data lakes and analytics',
        'Content distribution',
        'Disaster recovery',
        'Application data storage'
      ],
      pricingModel: 'Pay for storage used, requests, and data transfer',
      integrations: ['CloudFront', 'Lambda', 'CloudTrail', 'CloudWatch', 'IAM'],
      examTips: [
        'Know all storage classes: Standard, IA, One Zone-IA, Glacier, Deep Archive',
        'Understand consistency model: strong read-after-write',
        'Remember S3 Transfer Acceleration uses CloudFront',
        'Cross-region replication requires versioning enabled'
      ],
      limits: [
        'Bucket names must be globally unique',
        'Maximum object size: 5 TB',
        'Maximum number of buckets: 100 per account (soft limit)'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Storage',
        azure: 'Azure Blob Storage',
        alibabaCloud: 'Object Storage Service (OSS)'
      }
    },
    {
      id: 'ebs',
      name: 'Amazon EBS',
      description: 'High-performance block storage for EC2 instances',
      tier: 'core',
      keyFeatures: [
        'Multiple volume types (gp3, gp2, io2, io1, st1, sc1)',
        'Snapshots to S3',
        'Encryption at rest and in transit',
        'Multi-Attach for io1 and io2',
        'Elastic Volumes',
        'Fast Snapshot Restore'
      ],
      useCases: [
        'Database storage',
        'File systems',
        'Boot volumes',
        'Data warehousing',
        'Distributed file systems'
      ],
      pricingModel: 'Pay for provisioned storage and IOPS',
      integrations: ['EC2', 'S3', 'KMS', 'CloudWatch'],
      examTips: [
        'gp3 is the latest general purpose SSD',
        'io2 Block Express for highest performance',
        'st1 for throughput-optimized workloads',
        'sc1 for cold, infrequently accessed data'
      ],
      limits: [
        'Maximum volume size varies by type (up to 64 TiB for most)',
        'Maximum IOPS: 64,000 for io2 Block Express',
        'Snapshots stored in S3 but not directly accessible'
      ],
      cloudComparisons: {
        googleCloud: 'Google Persistent Disk',
        azure: 'Azure Managed Disks',
        alibabaCloud: 'Elastic Block Storage'
      }
    }
  ],
  database: [
    {
      id: 'rds',
      name: 'Amazon RDS',
      description: 'Managed relational database service',
      tier: 'core',
      keyFeatures: [
        'Multiple database engines (MySQL, PostgreSQL, Oracle, SQL Server, MariaDB)',
        'Automated backups and point-in-time recovery',
        'Multi-AZ deployments for high availability',
        'Read replicas for read scaling',
        'Automated patching and maintenance',
        'Performance Insights',
        'Enhanced monitoring'
      ],
      useCases: [
        'Web and mobile applications',
        'E-commerce platforms',
        'Online gaming',
        'Data warehousing (with appropriate instance types)',
        'Content management systems'
      ],
      pricingModel: 'Pay for instance hours, storage, I/O requests, and backup storage',
      integrations: ['VPC', 'CloudWatch', 'IAM', 'KMS', 'Lambda'],
      examTips: [
        'Multi-AZ provides high availability, not performance improvement',
        'Read replicas can be cross-region',
        'Aurora is a separate service, not part of RDS',
        'Automated backups retained for 0-35 days'
      ],
      limits: [
        'Maximum storage: 64 TiB for most engines',
        'Maximum read replicas: 5 per source DB',
        'Backup retention: 0-35 days'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud SQL',
        azure: 'Azure Database for MySQL/PostgreSQL/SQL Server',
        alibabaCloud: 'ApsaraDB RDS'
      }
    },
    {
      id: 'dynamodb',
      name: 'Amazon DynamoDB',
      description: 'Fast and flexible NoSQL database service',
      tier: 'core',
      keyFeatures: [
        'Single-digit millisecond latency',
        'Automatic scaling',
        'Global tables for multi-region replication',
        'DynamoDB Streams for change data capture',
        'Point-in-time recovery',
        'On-demand and provisioned billing modes',
        'DAX for microsecond latency'
      ],
      useCases: [
        'Mobile and web applications',
        'Gaming applications',
        'IoT applications',
        'Real-time personalization',
        'Shopping carts',
        'Session management'
      ],
      pricingModel: 'Pay for read/write capacity units or on-demand requests',
      integrations: ['Lambda', 'API Gateway', 'CloudWatch', 'IAM', 'VPC Endpoints'],
      examTips: [
        'Eventually consistent reads by default, strongly consistent available',
        'Global Secondary Indexes (GSI) vs Local Secondary Indexes (LSI)',
        'DynamoDB Accelerator (DAX) for caching',
        'Understand partition key and sort key design'
      ],
      limits: [
        'Item size: 400 KB maximum',
        'Table name length: 3-255 characters',
        'Attribute name length: 1-255 characters'
      ],
      cloudComparisons: {
        googleCloud: 'Google Firestore / Cloud Bigtable',
        azure: 'Azure Cosmos DB',
        alibabaCloud: 'Table Store'
      }
    },
    {
      id: 'aurora',
      name: 'Amazon Aurora',
      description: 'MySQL and PostgreSQL-compatible relational database',
      tier: 'important',
      keyFeatures: [
        'Up to 5x faster than MySQL, 3x faster than PostgreSQL',
        'Storage auto-scaling up to 128 TiB',
        'Up to 15 read replicas',
        'Global Database for cross-region replication',
        'Aurora Serverless for variable workloads',
        'Backtrack for point-in-time recovery',
        'Parallel Query for analytics'
      ],
      useCases: [
        'Enterprise applications',
        'SaaS applications',
        'Web applications',
        'Online gaming',
        'Data analytics'
      ],
      pricingModel: 'Pay for compute instances, storage consumed, and I/O requests',
      integrations: ['VPC', 'CloudWatch', 'IAM', 'Lambda', 'RDS Proxy'],
      examTips: [
        'Aurora storage is automatically replicated 6 ways across 3 AZs',
        'Aurora Serverless automatically scales compute capacity',
        'Global Database spans multiple regions',
        'Compatible with MySQL and PostgreSQL'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Spanner / AlloyDB',
        azure: 'Azure Database for PostgreSQL Hyperscale',
        alibabaCloud: 'PolarDB'
      }
    },
    {
      id: 'elasticache',
      name: 'Amazon ElastiCache',
      description: 'In-memory caching service',
      tier: 'important',
      keyFeatures: [
        'Redis and Memcached engines',
        'Sub-millisecond latency',
        'Automatic failover and backup',
        'Scaling and replication',
        'Security and compliance',
        'Monitoring and metrics',
        'Global Datastore for Redis'
      ],
      useCases: [
        'Database caching',
        'Session storage',
        'Real-time analytics',
        'Gaming leaderboards',
        'Chat and messaging',
        'Machine learning'
      ],
      pricingModel: 'Pay for cache node hours and data transfer',
      integrations: ['VPC', 'CloudWatch', 'SNS', 'Lambda'],
      examTips: [
        'Redis supports more data structures than Memcached',
        'Redis supports persistence and replication',
        'Memcached is simpler and faster for basic caching',
        'Global Datastore provides cross-region replication for Redis'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Memorystore',
        azure: 'Azure Cache for Redis',
        alibabaCloud: 'ApsaraDB for Redis'
      }
    }
  ],
  networking: [
    {
      id: 'vpc',
      name: 'Amazon VPC',
      description: 'Isolated cloud resources in a virtual network',
      tier: 'core',
      keyFeatures: [
        'Subnets for network segmentation',
        'Route tables for traffic routing',
        'Internet and NAT gateways',
        'Security groups and NACLs',
        'VPC peering and Transit Gateway',
        'VPC endpoints for private connectivity',
        'Flow logs for network monitoring'
      ],
      useCases: [
        'Multi-tier web applications',
        'Hybrid cloud connectivity',
        'Secure application hosting',
        'Development and testing environments',
        'Disaster recovery'
      ],
      pricingModel: 'No charge for VPC itself, pay for NAT gateways, VPN connections, etc.',
      integrations: ['EC2', 'RDS', 'Lambda', 'ELB', 'CloudWatch'],
      examTips: [
        'Default VPC vs Custom VPC differences',
        'Security Groups are stateful, NACLs are stateless',
        'VPC peering is not transitive',
        'Understand CIDR block planning'
      ],
      limits: [
        'VPCs per region: 5 (soft limit)',
        'Subnets per VPC: 200',
        'Security groups per VPC: 2,500'
      ],
      cloudComparisons: {
        googleCloud: 'Google Virtual Private Cloud (VPC)',
        azure: 'Azure Virtual Network (VNet)',
        alibabaCloud: 'Virtual Private Cloud (VPC)'
      }
    },
    {
      id: 'cloudfront',
      name: 'Amazon CloudFront',
      description: 'Global content delivery network (CDN)',
      tier: 'important',
      keyFeatures: [
        'Global edge locations',
        'Origin failover',
        'Lambda@Edge for edge computing',
        'Real-time logs and metrics',
        'SSL/TLS termination',
        'Geo-restriction',
        'Signed URLs and cookies'
      ],
      useCases: [
        'Static and dynamic content delivery',
        'Video streaming',
        'API acceleration',
        'Software distribution',
        'Security at the edge'
      ],
      pricingModel: 'Pay for data transfer out and HTTP/HTTPS requests',
      integrations: ['S3', 'EC2', 'ELB', 'Lambda', 'WAF', 'Shield'],
      examTips: [
        'Origins can be S3, EC2, ELB, or custom HTTP servers',
        'Lambda@Edge runs at edge locations',
        'Understand caching behaviors and TTL',
        'Price classes affect edge location usage'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud CDN',
        azure: 'Azure Content Delivery Network',
        alibabaCloud: 'Alibaba Cloud CDN'
      }
    },
    {
      id: 'elb',
      name: 'Elastic Load Balancing',
      description: 'Distribute incoming traffic across multiple targets',
      tier: 'core',
      keyFeatures: [
        'Application Load Balancer (ALB) for HTTP/HTTPS',
        'Network Load Balancer (NLB) for TCP/UDP',
        'Gateway Load Balancer (GWLB) for third-party appliances',
        'Health checks and auto-scaling integration',
        'SSL/TLS termination',
        'Cross-zone load balancing',
        'Sticky sessions'
      ],
      useCases: [
        'High availability web applications',
        'Microservices load balancing',
        'SSL offloading',
        'Blue-green deployments',
        'A/B testing'
      ],
      pricingModel: 'Pay for load balancer hours and data processed',
      integrations: ['EC2', 'Auto Scaling', 'Route 53', 'CloudWatch', 'WAF'],
      examTips: [
        'ALB operates at Layer 7 (HTTP/HTTPS)',
        'NLB operates at Layer 4 (TCP/UDP)',
        'GWLB for third-party network appliances',
        'Cross-zone load balancing distributes evenly across AZs'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Load Balancing',
        azure: 'Azure Load Balancer / Application Gateway',
        alibabaCloud: 'Server Load Balancer (SLB)'
      }
    },
    {
      id: 'route53',
      name: 'Amazon Route 53',
      description: 'Scalable domain name system (DNS) web service',
      tier: 'important',
      keyFeatures: [
        'DNS resolution and domain registration',
        'Health checks and failover',
        'Traffic routing policies',
        'Alias records for AWS resources',
        'Private hosted zones',
        'DNS query logging',
        'DNSSEC support'
      ],
      useCases: [
        'Domain name management',
        'Traffic routing and failover',
        'Health monitoring',
        'Hybrid cloud DNS',
        'Blue-green deployments'
      ],
      pricingModel: 'Pay for hosted zones, queries, and health checks',
      integrations: ['CloudFront', 'ELB', 'S3', 'CloudWatch', 'EC2'],
      examTips: [
        'Routing policies: Simple, Weighted, Latency, Failover, Geolocation, Multivalue',
        'Alias records are free and automatically resolve to AWS resource IPs',
        'Health checks can monitor endpoints and trigger failover',
        'Private hosted zones for VPC internal DNS'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud DNS',
        azure: 'Azure DNS',
        alibabaCloud: 'Alibaba Cloud DNS'
      }
    }
  ],
  security: [
    {
      id: 'iam',
      name: 'AWS IAM',
      description: 'Identity and Access Management',
      tier: 'core',
      keyFeatures: [
        'Users, groups, and roles',
        'Policies for fine-grained permissions',
        'Multi-factor authentication (MFA)',
        'Identity federation',
        'Access keys and temporary credentials',
        'Cross-account access',
        'Policy simulator'
      ],
      useCases: [
        'User access management',
        'Application permissions',
        'Cross-account access',
        'Federated access',
        'Service-to-service authentication'
      ],
      pricingModel: 'No additional charge for IAM',
      integrations: ['All AWS services'],
      examTips: [
        'Principle of least privilege',
        'Roles are preferred over access keys',
        'Understand policy evaluation logic',
        'Cross-account roles vs resource-based policies'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Identity and Access Management (IAM)',
        azure: 'Azure Active Directory (Azure AD)',
        alibabaCloud: 'Resource Access Management (RAM)'
      }
    },
    {
      id: 'kms',
      name: 'AWS KMS',
      description: 'Managed encryption key service',
      tier: 'important',
      keyFeatures: [
        'Customer managed keys (CMK)',
        'Automatic key rotation',
        'Integration with AWS services',
        'CloudTrail logging',
        'Cross-region key replication',
        'Key policies and grants',
        'Hardware security modules (HSM)'
      ],
      useCases: [
        'Data encryption at rest',
        'Data encryption in transit',
        'Digital signing',
        'Compliance requirements',
        'Database encryption'
      ],
      pricingModel: 'Pay per key per month and per API request',
      integrations: ['S3', 'EBS', 'RDS', 'Lambda', 'CloudTrail'],
      examTips: [
        'Customer managed vs AWS managed keys',
        'Envelope encryption for large data',
        'Key policies vs IAM policies',
        'Understand key rotation'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Key Management Service (KMS)',
        azure: 'Azure Key Vault',
        alibabaCloud: 'Key Management Service (KMS)'
      }
    }
  ],
  analytics: [
    {
      id: 'redshift',
      name: 'Amazon Redshift',
      description: 'Fast, simple, cost-effective data warehouse',
      tier: 'important',
      keyFeatures: [
        'Columnar storage',
        'Massively parallel processing (MPP)',
        'Automatic backups and snapshots',
        'Encryption at rest and in transit',
        'Redshift Spectrum for S3 queries',
        'Concurrency scaling',
        'Workload management'
      ],
      useCases: [
        'Data warehousing',
        'Business intelligence',
        'Analytics and reporting',
        'Data lake analytics',
        'ETL processing'
      ],
      pricingModel: 'Pay for compute nodes by hour, plus backup storage',
      integrations: ['S3', 'DynamoDB', 'EMR', 'QuickSight', 'Glue'],
      examTips: [
        'Single-AZ deployment only',
        'Redshift Spectrum queries S3 without loading data',
        'Understand distribution styles and sort keys',
        'Snapshots can be automated or manual'
      ],
      cloudComparisons: {
        googleCloud: 'Google BigQuery',
        azure: 'Azure Synapse Analytics',
        alibabaCloud: 'AnalyticDB'
      }
    },
    {
      id: 'kinesis',
      name: 'Amazon Kinesis',
      description: 'Real-time data streaming platform',
      tier: 'important',
      keyFeatures: [
        'Kinesis Data Streams for real-time processing',
        'Kinesis Data Firehose for data delivery',
        'Kinesis Analytics for stream processing',
        'Kinesis Video Streams',
        'Automatic scaling',
        'Multiple consumers',
        'Retention up to 365 days'
      ],
      useCases: [
        'Real-time analytics',
        'Log and event data collection',
        'IoT data processing',
        'Clickstream analysis',
        'Real-time dashboards'
      ],
      pricingModel: 'Pay for shards per hour and PUT payload units',
      integrations: ['Lambda', 'S3', 'Redshift', 'Elasticsearch', 'EMR'],
      examTips: [
        'Data Streams vs Data Firehose differences',
        'Understand sharding and partition keys',
        'Kinesis Analytics uses SQL for stream processing',
        'Video Streams for video ingestion and processing'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Pub/Sub / Dataflow',
        azure: 'Azure Event Hubs / Stream Analytics',
        alibabaCloud: 'DataHub / Stream Compute'
      }
    }
  ],
  management: [
    {
      id: 'cloudwatch',
      name: 'Amazon CloudWatch',
      description: 'Monitoring and observability service',
      tier: 'core',
      keyFeatures: [
        'Metrics collection and monitoring',
        'Custom metrics and dashboards',
        'Alarms and notifications',
        'Logs aggregation and analysis',
        'Events and rules',
        'Application Insights',
        'Container Insights'
      ],
      useCases: [
        'Infrastructure monitoring',
        'Application performance monitoring',
        'Log analysis',
        'Automated responses to events',
        'Cost optimization',
        'Security monitoring'
      ],
      pricingModel: 'Pay for metrics, logs ingestion, dashboard usage, and alarms',
      integrations: ['EC2', 'Lambda', 'RDS', 'S3', 'SNS', 'Auto Scaling'],
      examTips: [
        'Basic vs detailed monitoring',
        'Custom metrics require CloudWatch agent',
        'Understand metric retention periods',
        'CloudWatch Events vs EventBridge'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Monitoring (Stackdriver)',
        azure: 'Azure Monitor',
        alibabaCloud: 'CloudMonitor'
      }
    },
    {
      id: 'cloudformation',
      name: 'AWS CloudFormation',
      description: 'Infrastructure as Code service',
      tier: 'important',
      keyFeatures: [
        'JSON and YAML template support',
        'Stack management',
        'Change sets for preview',
        'Rollback capabilities',
        'Cross-stack references',
        'Nested stacks',
        'StackSets for multi-account deployment'
      ],
      useCases: [
        'Infrastructure automation',
        'Environment replication',
        'Disaster recovery',
        'Compliance and governance',
        'Multi-account deployments'
      ],
      pricingModel: 'No additional charge for CloudFormation, pay for AWS resources created',
      integrations: ['All AWS services'],
      examTips: [
        'Templates define resources declaratively',
        'Understand stack lifecycle and dependencies',
        'Change sets show what will change before execution',
        'StackSets deploy across multiple accounts/regions'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Deployment Manager',
        azure: 'Azure Resource Manager (ARM) Templates',
        alibabaCloud: 'Resource Orchestration Service (ROS)'
      }
    }
  ],
  integration: [
    {
      id: 'sqs',
      name: 'Amazon SQS',
      description: 'Fully managed message queuing service',
      tier: 'important',
      keyFeatures: [
        'Standard and FIFO queues',
        'Dead letter queues',
        'Message visibility timeout',
        'Long polling',
        'Server-side encryption',
        'Message deduplication',
        'Batch operations'
      ],
      useCases: [
        'Decoupling microservices',
        'Batch job processing',
        'Auto Scaling triggers',
        'Fault-tolerant systems',
        'Order processing'
      ],
      pricingModel: 'Pay per request (first 1M requests per month free)',
      integrations: ['Lambda', 'EC2', 'SNS', 'CloudWatch'],
      examTips: [
        'Standard queues: at-least-once delivery, best-effort ordering',
        'FIFO queues: exactly-once processing, strict ordering',
        'Visibility timeout prevents duplicate processing',
        'Dead letter queues for failed messages'
      ],
      limits: [
        'Message size: 256 KB maximum',
        'Message retention: 1 minute to 14 days',
        'FIFO throughput: 300 TPS (3,000 with batching)'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Pub/Sub',
        azure: 'Azure Service Bus',
        alibabaCloud: 'Message Queue (MQ)'
      }
    },
    {
      id: 'sns',
      name: 'Amazon SNS',
      description: 'Fully managed pub/sub messaging service',
      tier: 'important',
      keyFeatures: [
        'Topics and subscriptions',
        'Multiple protocol support (HTTP, email, SMS, SQS)',
        'Message filtering',
        'Dead letter queues',
        'Message encryption',
        'Mobile push notifications',
        'Fan-out messaging'
      ],
      useCases: [
        'Application alerts and notifications',
        'Mobile push notifications',
        'Email and SMS messaging',
        'Fan-out to multiple services',
        'System monitoring alerts'
      ],
      pricingModel: 'Pay per message published and delivered',
      integrations: ['SQS', 'Lambda', 'HTTP endpoints', 'Email', 'SMS'],
      examTips: [
        'Topics are communication channels',
        'Subscribers receive messages from topics',
        'Message filtering reduces unnecessary processing',
        'SNS-SQS fan-out pattern is common'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Pub/Sub',
        azure: 'Azure Event Grid / Notification Hubs',
        alibabaCloud: 'Message Service (MNS)'
      }
    },
    {
      id: 'api-gateway',
      name: 'Amazon API Gateway',
      description: 'Fully managed API management service',
      tier: 'important',
      keyFeatures: [
        'RESTful and WebSocket APIs',
        'Request/response transformation',
        'Authentication and authorization',
        'Rate limiting and throttling',
        'Caching',
        'API versioning',
        'SDK generation'
      ],
      useCases: [
        'Serverless API backends',
        'Microservices APIs',
        'Mobile and web app backends',
        'API monetization',
        'Legacy system modernization'
      ],
      pricingModel: 'Pay per API call and data transfer',
      integrations: ['Lambda', 'EC2', 'ELB', 'Cognito', 'WAF'],
      examTips: [
        'REST vs HTTP vs WebSocket APIs',
        'Edge-optimized vs Regional vs Private endpoints',
        'Understand stages and deployments',
        'Lambda proxy integration is common'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Endpoints / Apigee',
        azure: 'Azure API Management',
        alibabaCloud: 'API Gateway'
      }
    }
  ],
  'machine-learning': [
    {
      id: 'sagemaker',
      name: 'Amazon SageMaker',
      description: 'Fully managed machine learning platform',
      tier: 'supplementary',
      keyFeatures: [
        'Jupyter notebooks',
        'Built-in algorithms',
        'Model training and tuning',
        'Model hosting and endpoints',
        'A/B testing',
        'Data labeling',
        'Feature store'
      ],
      useCases: [
        'Machine learning model development',
        'Model training and deployment',
        'Data science experimentation',
        'ML pipeline automation',
        'Real-time inference'
      ],
      pricingModel: 'Pay for compute instances, storage, and model endpoints',
      integrations: ['S3', 'ECR', 'CloudWatch', 'IAM', 'VPC'],
      examTips: [
        'Fully managed ML service',
        'Supports popular ML frameworks',
        'Built-in algorithms for common use cases',
        'Can deploy models to real-time or batch endpoints'
      ],
      cloudComparisons: {
        googleCloud: 'Google AI Platform / Vertex AI',
        azure: 'Azure Machine Learning',
        alibabaCloud: 'Machine Learning Platform for AI (PAI)'
      }
    },
    {
      id: 'rekognition',
      name: 'Amazon Rekognition',
      description: 'Image and video analysis service',
      tier: 'supplementary',
      keyFeatures: [
        'Object and scene detection',
        'Facial analysis and recognition',
        'Text detection in images',
        'Content moderation',
        'Celebrity recognition',
        'Video analysis',
        'Custom labels'
      ],
      useCases: [
        'Content moderation',
        'Security and surveillance',
        'Media analysis',
        'User verification',
        'Accessibility features'
      ],
      pricingModel: 'Pay per image or video minute processed',
      integrations: ['S3', 'Lambda', 'Kinesis Video Streams'],
      examTips: [
        'Pre-trained models for common use cases',
        'Custom Labels for specific use cases',
        'Real-time and batch processing',
        'GDPR and privacy considerations'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Vision API',
        azure: 'Azure Computer Vision / Face API',
        alibabaCloud: 'Image Search / Content Moderation'
      }
    }
  ],
  'developer-tools': [
    {
      id: 'codepipeline',
      name: 'AWS CodePipeline',
      description: 'Continuous integration and delivery service',
      tier: 'supplementary',
      keyFeatures: [
        'Visual workflow builder',
        'Integration with AWS services',
        'Third-party tool integration',
        'Parallel and sequential actions',
        'Manual approval actions',
        'Artifact management',
        'Pipeline triggers'
      ],
      useCases: [
        'CI/CD pipelines',
        'Automated deployments',
        'Code release management',
        'Multi-environment deployments',
        'Infrastructure as code deployment'
      ],
      pricingModel: 'Pay per active pipeline per month',
      integrations: ['CodeCommit', 'CodeBuild', 'CodeDeploy', 'S3', 'CloudFormation'],
      examTips: [
        'Stages contain actions',
        'Actions can run in parallel or sequence',
        'Artifacts pass between stages',
        'Integration with third-party tools'
      ],
      cloudComparisons: {
        googleCloud: 'Google Cloud Build / Cloud Deploy',
        azure: 'Azure DevOps Pipelines',
        alibabaCloud: 'CodePipeline'
      }
    }
  ]
};
