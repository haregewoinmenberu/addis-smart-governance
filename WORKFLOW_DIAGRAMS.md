# Addis Smart Governance - Workflow Diagrams

## 1. Request Approval Workflow

```mermaid
flowchart TD
    Start([Request Submitted]) --> CreateInstance[Create Workflow Instance]
    CreateInstance --> Stage1[Stage 1: Initial Review]
    
    Stage1 --> Review1{Review Decision}
    Review1 -->|Approved| Stage2[Stage 2: Duplication Analysis]
    Review1 -->|Rejected| Rejected([Request Rejected])
    Review1 -->|Revision Requested| RevisionNeeded[Request Revision]
    
    RevisionNeeded --> Resubmit[User Resubmits]
    Resubmit --> Stage1
    
    Stage2 --> DupAnalysis[Analyze Against Existing Technologies]
    DupAnalysis --> DupCheck{Duplication Found?}
    
    DupCheck -->|High Similarity| DupRecommend[Recommend Reuse/Extension]
    DupCheck -->|Low Similarity| Stage3[Stage 3: Feasibility Study]
    
    DupRecommend --> DupDecision{Accept Recommendation?}
    DupDecision -->|Yes| Rejected
    DupDecision -->|No - Justify| Stage3
    
    Stage3 --> FeasibilityEval[Multi-Criteria Evaluation]
    FeasibilityEval --> EvalScores[Calculate Scores:<br/>Technical, Financial, Security,<br/>Infrastructure, Integration,<br/>Sustainability]
    
    EvalScores --> RiskAssessment{Overall Risk Score}
    RiskAssessment -->|High Risk| HighRiskReview[High Risk Review]
    RiskAssessment -->|Medium/Low Risk| Stage4[Stage 4: Budget Approval]
    
    HighRiskReview --> RiskDecision{Risk Acceptable?}
    RiskDecision -->|No| Rejected
    RiskDecision -->|Yes - Mitigate| Stage4
    
    Stage4 --> BudgetReview{Budget Review}
    BudgetReview -->|Approved| Stage5[Stage 5: Final Approval]
    BudgetReview -->|Rejected| Rejected
    BudgetReview -->|Revision Requested| RevisionNeeded
    
    Stage5 --> FinalReview{Final Decision}
    FinalReview -->|Approved| Approved([Request Approved])
    FinalReview -->|Rejected| Rejected
    
    Approved --> Notify1[Notify Submitter]
    Rejected --> Notify2[Notify Submitter]
    
    style Start fill:#90EE90
    style Approved fill:#90EE90
    style Rejected fill:#FFB6C1
    style DupAnalysis fill:#FFE4B5
    style FeasibilityEval fill:#FFE4B5
    style HighRiskReview fill:#FFA07A
```

## 2. Workflow Instance State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Request
    
    Draft --> Pending: Submit Request
    Draft --> Cancelled: Cancel
    
    Pending --> InProgress: Start Workflow
    Pending --> Cancelled: Cancel
    
    InProgress --> InProgress: Advance Stage
    InProgress --> RevisionRequested: Request Changes
    InProgress --> Rejected: Reject at Any Stage
    InProgress --> Approved: Complete All Stages
    
    RevisionRequested --> InProgress: Resubmit
    RevisionRequested --> Cancelled: Cancel
    
    Approved --> [*]
    Rejected --> [*]
    Cancelled --> [*]
    
    note right of InProgress
        Current Stage Tracking:
        - Stage Name
        - Stage Index
        - Approver Assignment
        - Action History
    end note
    
    note right of Approved
        Completion Metadata:
        - Completed At
        - Final Approver
        - All Stage History
    end note
```

## 3. Multi-Stage Approval Process

```mermaid
sequenceDiagram
    participant User as Sub-City User
    participant System as Workflow System
    participant Stage1 as Initial Reviewer
    participant Stage2 as Duplication Analyst
    participant Stage3 as Feasibility Evaluator
    participant Stage4 as Budget Approver
    participant Stage5 as Final Approver
    participant Notif as Notification Service
    
    User->>System: Submit Request
    System->>System: Create Workflow Instance
    System->>System: Set Stage 1 (Initial Review)
    System->>Notif: Notify Stage 1 Approver
    Notif->>Stage1: New Request Notification
    
    Stage1->>System: Review Request
    alt Approved
        Stage1->>System: Approve Stage 1
        System->>System: Advance to Stage 2
        System->>Notif: Notify Stage 2 Approver
        Notif->>Stage2: Duplication Analysis Required
        
        Stage2->>System: Perform Analysis
        Stage2->>System: Submit Analysis Results
        
        alt No Duplication
            System->>System: Advance to Stage 3
            System->>Notif: Notify Stage 3 Evaluator
            Notif->>Stage3: Feasibility Study Required
            
            Stage3->>System: Evaluate Request
            Stage3->>System: Submit Evaluation Scores
            
            alt Risk Acceptable
                System->>System: Advance to Stage 4
                System->>Notif: Notify Budget Approver
                Notif->>Stage4: Budget Review Required
                
                Stage4->>System: Review Budget
                alt Budget Approved
                    Stage4->>System: Approve Budget
                    System->>System: Advance to Stage 5
                    System->>Notif: Notify Final Approver
                    Notif->>Stage5: Final Approval Required
                    
                    Stage5->>System: Final Review
                    Stage5->>System: Approve Request
                    System->>System: Mark as Approved
                    System->>Notif: Notify Submitter
                    Notif->>User: Request Approved!
                else Budget Rejected
                    Stage4->>System: Reject
                    System->>System: Mark as Rejected
                    System->>Notif: Notify Submitter
                    Notif->>User: Request Rejected
                end
            else High Risk
                System->>System: Mark as Rejected
                System->>Notif: Notify Submitter
                Notif->>User: High Risk - Rejected
            end
        else Duplication Found
            Stage2->>System: Recommend Reuse
            System->>Notif: Notify Submitter
            Notif->>User: Duplication Found
        end
    else Rejected
        Stage1->>System: Reject Stage 1
        System->>System: Mark as Rejected
        System->>Notif: Notify Submitter
        Notif->>User: Request Rejected
    else Revision Requested
        Stage1->>System: Request Revision
        System->>System: Mark as Revision Requested
        System->>Notif: Notify Submitter
        Notif->>User: Revision Required
        User->>System: Resubmit with Changes
        System->>System: Reset to Stage 1
    end
```

## 4. Workflow Definition Structure

```mermaid
graph TB
    subgraph "Workflow Definition"
        WD[Workflow Definition]
        WD --> Name[Name: Request Approval]
        WD --> Code[Code: REQ_APPROVAL_V1]
        WD --> Entity[Entity Type: request_item]
        WD --> Active[Is Active: true]
        WD --> Stages[Stages Array]
    end
    
    subgraph "Stage Configuration"
        Stages --> S1[Stage 1: Initial Review]
        Stages --> S2[Stage 2: Duplication Analysis]
        Stages --> S3[Stage 3: Feasibility Study]
        Stages --> S4[Stage 4: Budget Approval]
        Stages --> S5[Stage 5: Final Approval]
        
        S1 --> S1Config["order: 1<br/>name: initial_review<br/>required_role: reviewer<br/>auto_advance: false"]
        S2 --> S2Config["order: 2<br/>name: duplication_analysis<br/>required_role: analyst<br/>auto_advance: false"]
        S3 --> S3Config["order: 3<br/>name: feasibility_study<br/>required_role: evaluator<br/>auto_advance: false"]
        S4 --> S4Config["order: 4<br/>name: budget_approval<br/>required_role: budget_approver<br/>auto_advance: false"]
        S5 --> S5Config["order: 5<br/>name: final_approval<br/>required_role: itdb_administrator<br/>auto_advance: false"]
    end
    
    style WD fill:#E6F3FF
    style Stages fill:#FFF4E6
```

## 5. Role-Based Workflow Routing

```mermaid
flowchart LR
    subgraph "Roles & Permissions"
        ITDB[ITDB Administrator]
        SubCity[Sub-City Administrator]
        Analyst[Duplication Analyst]
        Evaluator[Feasibility Evaluator]
        Budget[Budget Approver]
        Auditor[Auditor]
    end
    
    subgraph "Workflow Stages"
        Stage1[Initial Review]
        Stage2[Duplication Analysis]
        Stage3[Feasibility Study]
        Stage4[Budget Approval]
        Stage5[Final Approval]
    end
    
    subgraph "Actions"
        Submit[Submit Request]
        Review[Review & Approve]
        Analyze[Analyze Duplication]
        Evaluate[Evaluate Feasibility]
        ApproveBudget[Approve Budget]
        FinalApprove[Final Approval]
        ViewAudit[View Audit Trail]
    end
    
    SubCity --> Submit
    Submit --> Stage1
    
    ITDB --> Review
    Review --> Stage1
    Stage1 --> Stage2
    
    Analyst --> Analyze
    Analyze --> Stage2
    Stage2 --> Stage3
    
    Evaluator --> Evaluate
    Evaluate --> Stage3
    Stage3 --> Stage4
    
    Budget --> ApproveBudget
    ApproveBudget --> Stage4
    Stage4 --> Stage5
    
    ITDB --> FinalApprove
    FinalApprove --> Stage5
    
    Auditor --> ViewAudit
    ViewAudit -.-> Stage1
    ViewAudit -.-> Stage2
    ViewAudit -.-> Stage3
    ViewAudit -.-> Stage4
    ViewAudit -.-> Stage5
    
    style ITDB fill:#FFD700
    style SubCity fill:#87CEEB
    style Analyst fill:#98FB98
    style Evaluator fill:#DDA0DD
    style Budget fill:#F0E68C
    style Auditor fill:#FFA07A
```

## 6. Duplication Analysis Workflow

```mermaid
flowchart TD
    Start([New Request Received]) --> Extract[Extract Request Details]
    Extract --> Search[Search Existing Technologies]
    
    Search --> Compare[Compare Attributes:<br/>- Name Similarity<br/>- Category Match<br/>- Functionality Overlap<br/>- Owner Office]
    
    Compare --> Calculate[Calculate Similarity Score]
    Calculate --> Score{Similarity Score}
    
    Score -->|>= 80%| HighDup[High Duplication]
    Score -->|50-79%| MedDup[Medium Duplication]
    Score -->|< 50%| LowDup[Low Duplication]
    
    HighDup --> RecReuse[Recommend: Reuse Existing]
    MedDup --> RecExtend[Recommend: Extend Existing]
    LowDup --> RecNew[Recommend: Proceed as New]
    
    RecReuse --> CreateCase[Create Duplication Case]
    RecExtend --> CreateCase
    RecNew --> CreateCase
    
    CreateCase --> NotifyAnalyst[Notify Analyst]
    NotifyAnalyst --> AnalystReview{Analyst Review}
    
    AnalystReview -->|Confirm| SaveAnalysis[Save Analysis]
    AnalystReview -->|Override| ManualAnalysis[Manual Analysis]
    
    ManualAnalysis --> SaveAnalysis
    SaveAnalysis --> NotifySubmitter[Notify Submitter]
    NotifySubmitter --> End([Analysis Complete])
    
    style HighDup fill:#FFB6C1
    style MedDup fill:#FFE4B5
    style LowDup fill:#90EE90
```

## 7. Feasibility Study Evaluation

```mermaid
flowchart TD
    Start([Request Enters Feasibility Stage]) --> InitEval[Initialize Evaluation]
    
    InitEval --> Tech[Technical Feasibility]
    InitEval --> Fin[Financial Feasibility]
    InitEval --> Sec[Security Assessment]
    InitEval --> Infra[Infrastructure Readiness]
    InitEval --> Integ[Integration Complexity]
    InitEval --> Sust[Sustainability Analysis]
    
    Tech --> TechScore[Score: 0-100]
    Fin --> FinScore[Score: 0-100]
    Sec --> SecScore[Score: 0-100]
    Infra --> InfraScore[Score: 0-100]
    Integ --> IntegScore[Score: 0-100]
    Sust --> SustScore[Score: 0-100]
    
    TechScore --> Aggregate[Aggregate Scores]
    FinScore --> Aggregate
    SecScore --> Aggregate
    InfraScore --> Aggregate
    IntegScore --> Aggregate
    SustScore --> Aggregate
    
    Aggregate --> CalcRisk[Calculate Overall Risk Score]
    CalcRisk --> RiskLevel{Risk Level}
    
    RiskLevel -->|Score >= 80| LowRisk[Low Risk - Proceed]
    RiskLevel -->|Score 50-79| MedRisk[Medium Risk - Review]
    RiskLevel -->|Score < 50| HighRisk[High Risk - Escalate]
    
    LowRisk --> SaveStudy[Save Feasibility Study]
    MedRisk --> SaveStudy
    HighRisk --> SaveStudy
    
    SaveStudy --> Recommend[Generate Recommendation]
    Recommend --> NotifyEvaluator[Notify Evaluator for Review]
    NotifyEvaluator --> End([Evaluation Complete])
    
    style LowRisk fill:#90EE90
    style MedRisk fill:#FFE4B5
    style HighRisk fill:#FFB6C1
```

## 8. Activity Logging & Audit Trail

```mermaid
flowchart LR
    subgraph "User Actions"
        Login[User Login]
        Submit[Submit Request]
        Approve[Approve Stage]
        Reject[Reject Request]
        Update[Update Record]
        Delete[Delete Record]
    end
    
    subgraph "Activity Logger"
        Capture[Capture Action]
        Extract[Extract Metadata:<br/>- User ID<br/>- IP Address<br/>- User Agent<br/>- Timestamp]
        Record[Record Changes:<br/>- Old Values<br/>- New Values]
    end
    
    subgraph "Activity Log Storage"
        DB[(Activity Logs)]
        Polymorphic[Polymorphic Subject:<br/>- Subject Type<br/>- Subject ID]
    end
    
    subgraph "Audit Reports"
        Query[Query Logs]
        Filter[Filter by:<br/>- User<br/>- Module<br/>- Action<br/>- Date Range]
        Generate[Generate Audit Report]
    end
    
    Login --> Capture
    Submit --> Capture
    Approve --> Capture
    Reject --> Capture
    Update --> Capture
    Delete --> Capture
    
    Capture --> Extract
    Extract --> Record
    Record --> DB
    DB --> Polymorphic
    
    Polymorphic --> Query
    Query --> Filter
    Filter --> Generate
    
    style DB fill:#E6F3FF
    style Capture fill:#FFE4B5
    style Generate fill:#90EE90
```

## 9. Notification Flow

```mermaid
sequenceDiagram
    participant Event as System Event
    participant Service as Notification Service
    participant DB as Database
    participant Email as Email Channel
    participant InApp as In-App Channel
    participant SMS as SMS Channel
    participant User as User
    
    Event->>Service: Trigger Notification
    Note over Event,Service: Events: Workflow Stage Change,<br/>Approval Required, Request Status Update
    
    Service->>Service: Determine Recipients
    Service->>Service: Select Channels by Priority
    Service->>DB: Create Notification Record
    
    alt High Priority
        Service->>Email: Send Email
        Service->>SMS: Send SMS
        Service->>InApp: Create In-App Notification
        
        Email->>User: Email Delivered
        SMS->>User: SMS Delivered
        InApp->>User: In-App Alert
    else Medium Priority
        Service->>Email: Send Email
        Service->>InApp: Create In-App Notification
        
        Email->>User: Email Delivered
        InApp->>User: In-App Alert
    else Low Priority
        Service->>InApp: Create In-App Notification
        InApp->>User: In-App Alert
    end
    
    User->>InApp: Read Notification
    InApp->>DB: Mark as Read
    DB->>Service: Update Status
```

## Workflow System Features

### Key Capabilities

1. **Flexible Workflow Definitions**
   - Reusable workflow templates
   - Configurable stages with role-based routing
   - Support for multiple entity types (polymorphic)

2. **Multi-Stage Approval**
   - Sequential stage progression
   - Role-based approver assignment
   - Approval, rejection, and revision request actions

3. **Duplication Prevention**
   - Automated similarity analysis
   - Comparison with existing technologies
   - Recommendation engine (reuse/extend/new)

4. **Risk Assessment**
   - Multi-criteria feasibility evaluation
   - Weighted scoring system
   - Risk-based routing and escalation

5. **Audit & Compliance**
   - Complete activity logging
   - Polymorphic subject tracking
   - Comprehensive audit trail

6. **Notification System**
   - Multi-channel delivery (email, SMS, in-app)
   - Priority-based routing
   - Read/unread tracking

### Workflow States

- **Draft**: Initial creation, not yet submitted
- **Pending**: Submitted, awaiting workflow start
- **In Progress**: Active workflow, moving through stages
- **Revision Requested**: Changes required, returned to submitter
- **Approved**: Successfully completed all stages
- **Rejected**: Denied at any stage
- **Cancelled**: Withdrawn by submitter or admin

### Stage Actions

- **Approve**: Move to next stage
- **Reject**: Terminate workflow
- **Request Revision**: Return to submitter for changes
- **Pending**: Awaiting action from approver
