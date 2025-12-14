-- Linkforest: single pricing tier ($5/mo)
-- Replace tiered plans with a simple paid flag.

-- Add paid flag to users
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- Remove tier plan column from subscriptions
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "plan";

-- Remove the enum type used by the old plan column
DO $$
BEGIN
  DROP TYPE IF EXISTS "SubscriptionPlan";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
