import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number or Email is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          const isPhone = /^\+?[1-9]\d{6,14}$/.test(v)
          return isEmail || isPhone
        },
        message: 'Please enter a valid phone number or email address'
      }
    },
    passwordHash: {
      type: String,
      required: false, // null until signup is completed
      select: false    // never returned in queries by default
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: 'PulseMed User'
    },
    role: {
      type: String,
      enum: ['user', 'guest', 'admin'],
      default: 'user'
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    activeMedicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '500mg' },
        frequency: { type: String, default: 'Twice Daily' },
        timeOfDay: { type: String, default: 'After Meal' },
        startDate: { type: Date, default: Date.now },
        active: { type: Boolean, default: true }
      }
    ],
    interactionHistory: [
      {
        drug1: { type: String, required: true },
        drug2: { type: String, required: true },
        severity: { type: String, enum: ['Severe', 'Moderate', 'Mild', 'Safe'], default: 'Safe' },
        summary: { type: String },
        checkedAt: { type: Date, default: Date.now }
      }
    ],
    // OTP fields — stored as hash, never plaintext
    otpHash: {
      type: String,
      select: false
    },
    otpExpiry: {
      type: Date,
      select: false
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    otpLastSentAt: {
      type: Date,
      select: false
    },
    // Context: which flow is this OTP for?
    otpPurpose: {
      type: String,
      enum: ['signup', 'reset'],
      select: false
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
)

// Never return sensitive fields in toJSON
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    phone: this.phone,
    name: this.name || this.phone?.split('@')[0] || 'User',
    role: this.role || 'user',
    isGuest: this.isGuest || false,
    activeMedicines: this.activeMedicines || [],
    interactionHistory: this.interactionHistory || [],
    isPhoneVerified: this.isPhoneVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const User = mongoose.model('User', userSchema)
export default User
