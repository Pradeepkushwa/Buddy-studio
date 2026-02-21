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

ActiveRecord::Schema[8.1].define(version: 2025_02_22_000005) do
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
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.decimal "discount_percentage", precision: 5, scale: 2, default: "0.0"
    t.boolean "featured", default: false, null: false
    t.string "name", null: false
    t.decimal "offer_price", precision: 10, scale: 2
    t.decimal "price", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_packages_on_active"
    t.index ["category_id"], name: "index_packages_on_category_id"
    t.index ["featured"], name: "index_packages_on_featured"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.boolean "email_verified", default: false
    t.string "mobile_number"
    t.string "name"
    t.string "otp_code"
    t.datetime "otp_sent_at"
    t.string "password_digest", null: false
    t.string "role", default: "user", null: false
    t.datetime "updated_at", null: false
    t.string "verification_status", default: "pending"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "appointments", "packages"
  add_foreign_key "package_items", "equipment"
  add_foreign_key "package_items", "packages"
  add_foreign_key "packages", "categories"
end
