# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_21_194434) do
  create_table "appointments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "event_type"
    t.text "message"
    t.string "mobile_number"
    t.string "name", null: false
    t.integer "package_id"
    t.date "preferred_date"
    t.string "status", default: "new", null: false
    t.datetime "updated_at", null: false
    t.index ["package_id"], name: "index_appointments_on_package_id"
    t.index ["status"], name: "index_appointments_on_status"
  end

  create_table "bookings", force: :cascade do |t|
    t.string "alternate_contact_number"
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.text "event_address", null: false
    t.date "event_end_date", null: false
    t.date "event_start_date", null: false
    t.text "notes"
    t.integer "package_id", null: false
    t.string "phone_number", null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["package_id"], name: "index_bookings_on_package_id"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image_url"
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_categories_on_active"
    t.index ["position"], name: "index_categories_on_position"
  end

  create_table "equipment", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "equipment_type", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_equipment_on_active"
    t.index ["equipment_type"], name: "index_equipment_on_equipment_type"
  end

  create_table "gallery_items", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "media_type", default: "photo", null: false
    t.string "media_url", null: false
    t.integer "position", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "uploaded_by_id"
    t.index ["active"], name: "index_gallery_items_on_active"
    t.index ["category"], name: "index_gallery_items_on_category"
    t.index ["media_type"], name: "index_gallery_items_on_media_type"
    t.index ["uploaded_by_id"], name: "index_gallery_items_on_uploaded_by_id"
  end

  create_table "package_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "equipment_id", null: false
    t.string "notes"
    t.integer "package_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "updated_at", null: false
    t.index ["equipment_id"], name: "index_package_items_on_equipment_id"
    t.index ["package_id"], name: "index_package_items_on_package_id"
  end

  create_table "packages", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "approval_status", default: "approved", null: false
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.text "description"
    t.decimal "discount_percentage", precision: 5, scale: 2, default: "0.0"
    t.boolean "featured", default: false, null: false
    t.string "name", null: false
    t.decimal "offer_price", precision: 10, scale: 2
    t.decimal "price", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_packages_on_active"
    t.index ["approval_status"], name: "index_packages_on_approval_status"
    t.index ["category_id"], name: "index_packages_on_category_id"
    t.index ["featured"], name: "index_packages_on_featured"
  end

  create_table "reviews", force: :cascade do |t|
    t.boolean "approved", default: false, null: false
    t.integer "booking_id"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.text "feedback"
    t.string "name", null: false
    t.integer "rating", null: false
    t.datetime "updated_at", null: false
    t.index ["approved"], name: "index_reviews_on_approved"
    t.index ["booking_id"], name: "index_reviews_on_booking_id"
    t.index ["rating"], name: "index_reviews_on_rating"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.boolean "email_verified", default: false
    t.string "mobile_number"
    t.string "name"
    t.string "otp_code"
    t.datetime "otp_sent_at"
    t.string "password_digest", null: false
    t.string "pending_email"
    t.string "reset_otp"
    t.datetime "reset_otp_sent_at"
    t.string "role", default: "user", null: false
    t.datetime "updated_at", null: false
    t.string "verification_status", default: "pending"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "appointments", "packages"
  add_foreign_key "bookings", "packages"
  add_foreign_key "bookings", "users"
  add_foreign_key "gallery_items", "users", column: "uploaded_by_id"
  add_foreign_key "package_items", "equipment"
  add_foreign_key "package_items", "packages"
  add_foreign_key "packages", "categories"
  add_foreign_key "packages", "users", column: "created_by_id"
  add_foreign_key "reviews", "bookings"
end
