import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Auth Schema
// Synced with: entrolytics/packages/db/src/schema/auth.ts
// ============================================================================

export const user = pgTable(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }),
    displayName: varchar('display_name', { length: 255 }),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    imageUrl: varchar('image_url', { length: 2183 }),
    role: varchar('role', { length: 50 }).default('user').notNull(),

    // Onboarding tracking
    onboardingCompleted: varchar('onboarding_completed', { length: 5 }).default('false'),
    onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
    onboardingStep: varchar('onboarding_step', { length: 50 }).default('welcome'),
    onboardingSkipped: varchar('onboarding_skipped', { length: 5 }).default('false'),

    // Additional context
    companySize: varchar('company_size', { length: 50 }),
    industry: varchar('industry', { length: 100 }),
    useCase: varchar('use_case', { length: 500 }),
    referralSource: varchar('referral_source', { length: 100 }),

    // Email preferences
    emailWeeklyReports: boolean('email_weekly_reports').default(true),
    emailUsageAlerts: boolean('email_usage_alerts').default(true),
    emailProductUpdates: boolean('email_product_updates').default(true),

    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    clerkIdIdx: index('idx_user_clerk_id').on(table.clerkId),
    emailIdx: index('idx_user_email').on(table.email),
    deletedAtIdx: index('idx_user_deleted_at').on(table.deletedAt),
  }),
);

export const sessionToken = pgTable(
  'session_token',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).unique().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    lastUsedAt: timestamp('last_used_at').defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    tokenHashIdx: index('idx_session_token_hash').on(table.tokenHash),
    userIdx: index('idx_session_user').on(table.userId),
    expiresIdx: index('idx_session_expires').on(table.expiresAt),
  }),
);

export const cliToken = pgTable(
  'cli_token',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).unique().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
    revokedAt: timestamp('revoked_at'),
  },
  table => ({
    userIdx: index('idx_cli_token_user').on(table.userId),
    tokenHashIdx: index('idx_cli_token_hash').on(table.tokenHash),
  }),
);

export const cliSetupToken = pgTable(
  'cli_setup_token',
  {
    tokenId: uuid('id').defaultRandom().primaryKey(),
    token: varchar('token', { length: 255 }).unique().notNull(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    websiteId: uuid('website_id').notNull(),
    orgId: uuid('org_id'),
    purpose: varchar('purpose', { length: 50 }).default('cli-init').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    tokenIdx: index('idx_cli_setup_token').on(table.token),
    userIdx: index('idx_cli_setup_user').on(table.userId),
    statusIdx: index('idx_cli_setup_status').on(table.status),
  }),
);

// ============================================================================
// Organization Schema
// Synced with: entrolytics/packages/db/src/schema/organization.ts
// ============================================================================

export const organization = pgTable(
  'organization',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    accessCode: varchar('access_code', { length: 50 }).unique(),
    logoUrl: text('logo_url'),
    clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    slugIdx: index('idx_org_slug').on(table.slug),
    clerkIdIdx: index('idx_org_clerk_id').on(table.clerkOrgId),
    deletedAtIdx: index('idx_org_deleted_at').on(table.deletedAt),
  }),
);

export const orgMember = pgTable(
  'org_member',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 50 })
      .notNull()
      .$type<'owner' | 'admin' | 'member' | 'viewer'>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    orgIdx: index('idx_org_member_org').on(table.orgId),
    userIdx: index('idx_org_member_user').on(table.userId),
    orgUserUnique: unique('unique_org_user').on(table.orgId, table.userId),
  }),
);

export const orgInvitation = pgTable(
  'org_invitation',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    invitedBy: uuid('invited_by').references(() => user.id),
    token: varchar('token', { length: 255 }).unique().notNull(),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('pending')
      .$type<'pending' | 'accepted' | 'expired'>(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    tokenIdx: index('idx_invitation_token').on(table.token),
    orgIdx: index('idx_invitation_org').on(table.orgId),
  }),
);

// ============================================================================
// Website Schema
// Synced with: entrolytics/packages/db/src/schema/website.ts
// ============================================================================

export const website = pgTable(
  'website',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => user.id),
    name: varchar('name', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    shareId: varchar('share_id', { length: 50 }).unique(),
    resetAt: timestamp('reset_at', { withTimezone: true }),
    ingestMode: varchar('ingest_mode', { length: 10 }).default('auto').notNull(),
    createdBy: uuid('created_by').references(() => user.id),
    timezone: varchar('timezone', { length: 100 }).default('UTC'),
    public: boolean('public').default(false),

    // Tracking settings
    autoTrackPageviews: boolean('auto_track_pageviews').default(true),
    autoTrackSessions: boolean('auto_track_sessions').default(true),
    excludeQueryParams: text('exclude_query_params').array(),

    // Privacy settings
    anonymizeIps: boolean('anonymize_ips').default(false),
    respectDnt: boolean('respect_dnt').default(true),
    cookieConsentRequired: boolean('cookie_consent_required').default(false),

    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    orgIdx: index('idx_website_org').on(table.orgId),
    domainIdx: index('idx_website_domain').on(table.domain),
  }),
);

export const apiKey = pgTable(
  'api_key',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    websiteId: uuid('website_id')
      .references(() => website.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),

    // Key storage (prefix visible, hash stored)
    prefix: varchar('prefix', { length: 20 }).notNull(),
    keyHash: varchar('key_hash', { length: 255 }).unique().notNull(),

    // Scoped permissions
    scopes: text('scopes').array().notNull().default(['events:write']),

    // Rate limiting (per key)
    rateLimitMax: integer('rate_limit_max').default(1000),
    rateLimitWindow: integer('rate_limit_window').default(3600),

    // CORS & domain restrictions
    allowedDomains: text('allowed_domains').array(),
    allowedOrigins: text('allowed_origins').array(),

    // Usage tracking
    lastUsedAt: timestamp('last_used_at'),
    requestsCount: integer('requests_count').default(0),

    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  table => ({
    keyHashIdx: index('idx_api_key_hash').on(table.keyHash),
    websiteIdx: index('idx_api_key_website').on(table.websiteId),
    prefixIdx: index('idx_api_key_prefix').on(table.prefix),
    deletedAtIdx: index('idx_api_key_deleted_at').on(table.deletedAt),
  }),
);

// ============================================================================
// Reports Schema
// Synced with: entrolytics/packages/db/src/schema/reports.ts
// ============================================================================

export const report = pgTable(
  'report',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    websiteId: uuid('website_id')
      .references(() => website.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').references(() => user.id),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 50 })
      .notNull()
      .$type<'pageviews' | 'events' | 'funnel' | 'retention' | 'journey' | 'goal'>(),
    config: jsonb('config').notNull(),
    isFavorite: boolean('is_favorite').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    websiteIdx: index('idx_report_website').on(table.websiteId),
    typeIdx: index('idx_report_type').on(table.type),
  }),
);

// ============================================================================
// Billing Schema
// Synced with: entrolytics/packages/db/src/schema/billing.ts
// ============================================================================

export const subscription = pgTable(
  'subscription',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripePriceId: varchar('stripe_price_id', { length: 255 }),
    planId: varchar('plan_id', { length: 50 })
      .notNull()
      .$type<'free' | 'pro' | 'business' | 'enterprise'>(),
    status: varchar('status', { length: 50 })
      .notNull()
      .$type<'active' | 'canceled' | 'past_due' | 'trialing'>(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),

    // Limits
    eventsLimit: integer('events_limit').notNull(),
    websitesLimit: integer('websites_limit').notNull(),
    teamMembersLimit: integer('team_members_limit').notNull(),

    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAt: timestamp('cancel_at'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    orgIdx: index('idx_subscription_org').on(table.orgId),
    userIdx: index('idx_subscription_user').on(table.userId),
    stripeIdx: index('idx_subscription_stripe').on(table.stripeSubscriptionId),
  }),
);

export const usageRecord = pgTable(
  'usage_record',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    eventsCount: bigint('events_count', { mode: 'number' }).default(0),
    pageviews: bigint('pageviews', { mode: 'number' }).default(0),
    customEvents: bigint('custom_events', { mode: 'number' }).default(0),
    linkClicks: bigint('link_clicks', { mode: 'number' }).default(0),
    pixelFires: bigint('pixel_fires', { mode: 'number' }).default(0),
    websitesCount: integer('websites_count').default(0),
    teamMembersCount: integer('team_members_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    orgIdx: index('idx_usage_org').on(table.orgId),
    periodIdx: index('idx_usage_period').on(table.periodStart, table.periodEnd),
  }),
);
