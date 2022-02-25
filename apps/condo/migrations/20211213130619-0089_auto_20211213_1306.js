// auto generated by kmigrator
// KMIGRATOR:0089_auto_20211213_1306:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi44IG9uIDIwMjEtMTItMTMgMTM6MDYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwODhfYXV0b18yMDIxMTIwN18xMDM3JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwYXltZW50JywKICAgICAgICAgICAgbmFtZT0ncmVjaXBpZW50QmFua0FjY291bnQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGRlZmF1bHQ9J0lOSVRJVEFMJyksCiAgICAgICAgICAgIHByZXNlcnZlX2RlZmF1bHQ9RmFsc2UsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwYXltZW50JywKICAgICAgICAgICAgbmFtZT0ncmVjaXBpZW50QmljJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChkZWZhdWx0PSdJTklUSUFMJyksCiAgICAgICAgICAgIHByZXNlcnZlX2RlZmF1bHQ9RmFsc2UsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwYXltZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J3JlY2lwaWVudEJhbmtBY2NvdW50JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ncGF5bWVudGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdyZWNpcGllbnRCaWMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field recipientBankAccount to payment
--
ALTER TABLE "Payment" ADD COLUMN "recipientBankAccount" text DEFAULT 'INITITAL' NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "recipientBankAccount" DROP DEFAULT;
--
-- Add field recipientBic to payment
--
ALTER TABLE "Payment" ADD COLUMN "recipientBic" text DEFAULT 'INITIAL' NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "recipientBic" DROP DEFAULT;
--
-- Add field recipientBankAccount to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" ADD COLUMN "recipientBankAccount" text NULL;
--
-- Add field recipientBic to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" ADD COLUMN "recipientBic" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field recipientBic to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" DROP COLUMN "recipientBic" CASCADE;
--
-- Add field recipientBankAccount to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" DROP COLUMN "recipientBankAccount" CASCADE;
--
-- Add field recipientBic to payment
--
ALTER TABLE "Payment" DROP COLUMN "recipientBic" CASCADE;
--
-- Add field recipientBankAccount to payment
--
ALTER TABLE "Payment" DROP COLUMN "recipientBankAccount" CASCADE;
COMMIT;

    `)
}
