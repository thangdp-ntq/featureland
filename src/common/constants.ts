export const MIMEType = {
  APPLICATION_JSON: "application/json",
};

export const BlockChain = {
  Network: {
    BSC: [56, 97],
    ETH: [1, 3, 4, 5, 42],
  },
};

export const MAX_RETRY = 3;

export const TIME_WAIT_RETRY = 300;

export const DECIMALS_DAD = 8;

export const ACTIVE_LOG_DAY = 90;
export const USER_NOT_FOUND = "User not found";
export const API_SUCCESS = "1";
export const API_ERROR = "0";
export const VALIDATION_ERROR = -2;
export const INVALID_TOKEN = "Invalid token";
export const ADMIN_NOT_FOUND = "Admin not found";

export enum NFT_RESPOND_MESSAGE {
  META_DATA_FIELDS_IS_ARRAY = "meta data is array ",
  NFT_VALIDATE_FAIL = "nft validate fail",
  EN_META_DATA_FIELD_REQUIRE = "en meta data field require",
  JP_META_DATA_FIELD_REQUIRE = "jp meta data field require",
  CN_META_DATA_FIELD_REQUIRE = "cn meta data field require",
  EN_META_DATA_FIELD_TOO_LONG = "en meta data field max 256 character",
  JP_META_DATA_FIELD_TOO_LONG = "jp meta data field max 256 character",
  CN_META_DATA_FIELD_TOO_LONG = "cn meta data field max 256 character",
  VALUE_META_DATA_FIELD_REQUIRE = "value meta data field require",
  VALUE_MATE_DATA_FIELD_TOO_LONG = "value  meta data field max 256 character",
  LABEL_NAME_IS_EXIST = "label name is exist",
  LABEL_CAN_NOT_THE_SAME = "labels can not be the same",
  NFT_NOT_FOUND = "NFT Not Found",
  NFT_IS_DELETED = "NFT is delete",
  NFT_IS_MINTED = "NFT is minted",
  NFT_NOT_MINTED = "NFT is not minted",
  NFT_UPDATE_SUCCESS = "Updated successfully",
  NFT_UPDATE_FAIL = "Update failed",
  NFT_DELETE_SUCCESS = "Deleted successfully",
  NFT_REMOVE_SUCCESS = "Removed successfully",
  NFT_RESTORE_SUCCESS = "Restore successfully",
  NFT_DELETE_FAIL = "Delete failed",
  FILE_FORMAT_NOT_SUPPORT = "File format is invalid.",
  FILE_SIZE_ERROR = "File size error",
  FILE_SIZE_LIMIT_2MB_ERROR = "File size is exceeding 2MB",
  FILE_SIZE_LIMIT_10MB_ERROR = "File size is exceeding 10MB",
  FILE_IS_REQUIRE = "File is require",
  NFT_UPDATE_LABEL_SUCCESS = "Updated successfully",
  NFT_FRACTIONALIZED_SUCCESS = "Fraction nft successfully",
  ID_INVALID = "Id is invalid",
  CREATE_NFT_SUCCESS = "Created successfully",
  CREATE_NFT_FAIL = "Create nft failed",
  NFT_NAME_DUPLICATE_NAME = " Duplicate name nft",
  LABEL_NFT_NOT_FOUND = "Label attribute nft not found",
  UPDATE_LABEL_FAIL = "Update label fail",
  INDEX_ARRAY_WRONG = "Index array wrong",
  NFT_IS_FRACTIONALIZED = "Nft has been fractionalized ",
  NFT_SERVER_ERROR = "Server error",
  NFT_ALREADY_IN_POOL = "Nft already in pool",
}
export enum NFT_Status {
  NFT_MINT_PROCESSING = "processing",
  NFT_MINT_DONE = "done",
  NFT_MINT_FAIL = "fail",
  NFT_FRACTIONALIZED = "F",
  NFT_UN_FRACTIONALIZED = "UF",
}

export const SERIAL_RESPONSE_MESSAGE = {
  SERIAL_NOT_FOUND: "Serial not found",
  SERIAL_EXIST_IN_POOL: "Serial already exists in pool",
  SERIAL_DELETE_SUCCESS: "Serial deleted successfully",
  SERIAL_DELETE_SOFT_SUCCESS: "Serial soft deleted successfully",
  SERIAL_RESTORE_SUCCESS: "Serial restore successfully",
};

export const SORT_DESC = "desc";
export const SORT_ASC = "asc";
export enum CommonCode {
  DEFAULT_SUCCESS_MESSAGE = "success",
  DEFAULT_ERROR_MESSAGE = "error",
  DEFAULT_VALIDATION_ERROR_MESSAGE = "Validation error",
  NOT_ADMIN = "NOT_ADMIN",
  NOT_USER = "NOT_USER",
  ADMIN_NOT_ACCESS = "admin is not allowed to access",
  E0 = "E0",
  E1 = "1",
  E4 = "E4",
  E3 = "E3",
  E5 = "E5",
  E27 = "E27",
  E12 = "E12",
  ER03 = "ER03",
  ER04 = "ER04",
  ER05 = "ER05",
  PER06 = "PER06",
  CER06 = "CER06",
  ER07 = "ER07",
  PURCHASED_LIMIT_REACHED = "Purchased limit reached",
  OBJECT_ID_NOT_VALID = 405,
  NOT_FOUND = "NOT_FOUND",
  INVALID_TOKEN = "INVALID_TOKEN",
  WEB3_ERROR = "WEB3_ERROR",
}
export enum TieringStructureResponse {
  DUPLICATE_NAME = "The name of tiers cannot be the same",
  INVALID_TIER_NUMBER = "Value of tier number is invalid",
  NOT_EXIST = "Tier doesn't exist",
  INVALID_STAKING_QUANTITY = "The staking quantity requirements of the higher tiers must be greater than the lower tiers",
  INVALID_LENGTH_PERIOD = "stakingPeriod must be equal to or shorter than 90",
  INVALID_TYPE_PERIOD = "stakingPeriod must be number",
  INVALID_TYPE_QUANTITY = "stakingQuantity must be number",
  INVALID_LENGTH_QUANTITY = "stakingQuantity must be shorter than or equal to 9 characters",
}
export enum sortType {
  desc = "desc",
  asc = "asc",
}

export enum SORT_AGGREGATE {
  ASC = 1,
  DESC = -1,
}

export enum LANGUAGE {
  EN = "en",
  JP = "jp",
  CN = "cn",
}

export const FileUpload = {
  mimetypeImage: ["image/svg+xml", "image/png", "image/jpeg", "image/gif"],
  mimetypeVideo: ["video/mp4"],
  mimetypePdf: ["application/pdf"],
  mimetypeCsv: ["text/csv"],
  limitFile: 2 * 1024 * 1024, // 2MB,
  limitFileVideo: 100 * 1024 * 1024, // 100MB,
  limitFilePdf: 10 * 1024 * 1024,
};

export const messsage = {
  E2: "Your wallet has not been registered as admin, thus you cannot access the system.",
  E10000: "Admin are not allowed access during this period",
  E12: "This wallet address is not valid on the current network",
  E13: "This value cannot be greater than the Smart Contract Balance",
  E14: "This value must be greater than 0",
  E15: "This time must be later than the Registration Start Time",
  E16: "This time must be later than the Registration End Time",
  E17: "This time must be later than the Participation Start Time",
  E18: "The total percentages is not equal to 100%",
  E21: "This URL is invalid",
  E19: "Wallet address is not valid on the current network",
  E10: "The staking quantity requirements of the higher tiers must be greater than the lower tiers",
  ID_INVALID: "ID is invalid",
  E23: "Production Period End Time must be later than Production Period Start Time",
  E24: "Production Period Start Time must be later than Purchase End Time",
  E25: "Production Period End Time must be later than Purchase End Time",
  E26: "This time must be later than Purchase End Time",
  E27: "admin already existed.",
  E22: "This time must be earlier than the Purchase Start Time",
  E29: "This value must be less than or equal to the Total F-NFT amount",
  E30: "Production Period Start Time equals null Production Period End Time require",
  E31: "Production Period StartTime equals null Production PeriodEnd Time auto null",
  E32: "Allocation FCFS max decimal 4",
};

export enum F_NFT_POOL_STATUS {
  OFF = 0,
  ON = 1,
}
export enum TYPE_POOL {
  DRAFT = 0,
  ONCHAIN = 1,
}

export const POOL_NFT_MESSAGE = {
  POOL_NAME_EN_REQUIRE: "pool name en require",
  POOL_NAME_CN_REQUIRE: "pool name cn require",
  POOL_NAME_JP_REQUIRE: "pool nam jp require",
  POOL_NAME_EN_MAX_256: "pool name en max 256 character",
  POOL_NAME_JP_MAX_256: "pool name jp max 256 character",
  POOL_NAME_CN_MAX_256: "pool name cn max 256 character",
  POOL_DESCRIPTION_EN_MAX_256: "pool decription en max 5000 character",
  POOL_DESCRIPTION_JP_MAX_256: "pool decription jp max 5000 character",
  POOL_DESCRIPTION_CN_MAX_256: "pool decription cn max 5000 character",
  REWARD_POOL_NOT_SALE_SUCCESS: "FNFT Pool have not sold any fnft yet",
  FNFT_POOL_EXIST_REWARD_POOL: "FNFT Pool exist reward pool",
  REWARD_POOL_NOT_FOUND: "Reward pool not found",
  FNFT_NOT_ENOUGH_PURCHASE: "FNFT NOT ENOUGH PURCHASE",
  POOL_FCFS: "Pool is first come first service",
  ALLOCATION_SIZE_IS_REQUIRE: "Allocation size is require",
  RECEIVER_ADDRESS_EQUAL_ACA:
    "Accepted Currency Address Equal Receiver Address",
  TOTAL_REWARD_POOL_GREATER_ERROR: "This total value must be greater than 0",
  POOL_IS_PURCHASE: "pool is purchase",
  UPDATE_TIMELINE_SUCCESS: "Updated successfully",
  UPDATE_SUCCESS: "Updated successfully",
  UPDATE_FAIL: "Update  failed",
  TIME_LINE_NOT_FOUND: "Timeline not found",
  POOL_NOT_FOUND: "Pool not found",
  FELID_CAN_NOT_UPDATE: "field can not update",
  VALIDATE_SELECT_NFT_ERROR: "Validate data in step select NFT error",
  VALIDATE_GENERAL_INFO_ERROR: "Validate data in step general info error",
  VALIDATE_CONFIGURE_WHITELIST_ERROR:
    "Validate data in step configure whitelist error",
  VALIDATE_PRODUCTION_STAGE_ERROR:
    "Validate data in step production stage error",
  VALIDATE_CREATE_F_NFT_POOL_ERROR: "Validate data create f-nft pool error",
  VALIDATE_UPDATE_POOL_DRAFT_ERROR:
    "Validate data update f-nft pool draft error",
  VALIDATE_UPDATE_POOL_ON_CHAIN_ERROR:
    "Validate data update f-nft pool on chain error",
  VALIDATE_END_TIME_LINE:
    "The Stage Start Time cannot be after the Production Period End Time",
  VALIDATE_START_TIME_LINE:
    "The Stage Start Time cannot be before the Production Period Start Time",
  VALIDATE_STEP_TIME_LINE: "The start time lines can be sort ascending",
  UPLOAD_FAIL: "Upload image unsuccessfully",
  TOTAL_SOLD_ERROR:
    "totalSold cannot be greater than the Smart Contract Balance",
  NFT_NOT_EXIST: "NFT select isn't exist",
  DUPLICATE_F_NFT: "Pool name existed",
  UPDATE_TIME_LINE_SUCCESS: "Update timeline success",
  IMPORT_WHITE_LIST_FAIL: "Import white list fail",
  FILE_IS_REQUIRE: "File is require",
  SERIAL_NOT_EXIST: "Serial not exist",
  PATH_NOT_EXIST: "Path not exist",
  E15: "Registration End Time must be later than the Registration Start Time",
  E16: "Purchase Start Time must be later than the Registration End Time",
  E17: "Purchase End Time must be later than the Purchase Start Time",
  ALLOCATION_ERROR: "The total percentages is not equal to 100%",
  DATA_TIERING_STRUCTURE_INVALID: "Invalid tiering structure",
  POOL_NOT_EXIST: "F-NFT pool not exist",
  CAN_NOT_UPDATE_DRAFT_POOL_ON_CHAIN: "Can't update draft of pool on chain",
  INVALID_STATUS: "F-NFT pool is not on chain",
  STEP_OF_TIMELINE_NOT_EXIST: "Step of timeline not exist",
  CALCULATE_SUCCESS: "calculate success",
  IMPORT_USER_FCFS_SUCCESS: "import user first come first served successfully",
  CREATE_SUCCESS_TXT: "Created successfully",
  UPDATE_SUCCESS_TXT: "Updated successfully",
  AMOUNT_IN_VALID: "FNFT Pool total supply or available amount is invalid",
  E20: "E20",
  E26: "E26",
  NOT_ENOUGH_AMOUNT:
    "This value cannot be greater than the Smart Contract Balance",
  POOL_NAME_INVALID: "Pool name is invalid",
  POOL_DESCRIPTION_INVALID: "Pool description is invalid",
  WHITELIST_TIME_E22:
    "Whitelist Announcement Time must be earlier than the Purchase Start Time",
  WHITELIST_TIME_E15:
    "Whitelist Announcement Time must be later than the Registration End Time",
  INVALID_TOKEN: "Accepted Currency Address is invalid",
  NFT_IS_NOT_F: "Only create F-NFT Pool from NFT have status is F",
  NFT_IS_DETELED: "NFT is deleted",
  FNFT_POOL_EXIST: "The pool containing this fnft already exists",
  CONFLICT_CREATE_FNFT_POOL: "Conflict when creating new pool",
  WHITELIST_NOT_OPEN_YET: "Whitelist not open yet",
  POOL_ON_SALE: "The pool on sale",
};

export enum BLOCKCHAIN_NETWORK {
  BSC = "bsc",
}

export const USERNAME_DEFAULT = "admin";
export const USERNAME_WEB_DEFAULT = "user";

export const DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";

export enum POOL_TIERING_STATUS {
  OFF = 0,
  ON = 1,
}

export enum RewardPoolStatus {
  OFF = 0,
  ON = 1,
}

export enum RewardPoolMintStatus {
  PROCESSING = 0,
  DONE = 1,
}

export const POOL_TIERING_MESSAGE = {
  CREATE_POOL_Tiering_SUCCESS: "Created successfully",
  E17: "Start Join Time must be later than the End Join Time",
  POOL_NOT_FOUND: "Pool tiering not found",
  TIER_POOL_NOT_CREATE: "Pool tiering not create",
  UPDATE_POOL_SUCCESS: "Updated  successfully",
  UPDATE_POOL_FAIL: "Update failed",
};
export enum STAKING_TYPE {
  UNSTAKING = 2,
  STAKING = 1,
}

export const EVENT_SOCKET = {
  MINT_NFT_EVENT: "mint-nft-event",
  FRANCTIONAL_NFT_EVENT: "fractionalize-nft-event",
  MINT_F_NFT_POOL: "mint-f-nft-pool-event",
  PURCHASE_F_NFT: "purchase-f-nft-event",
  CREATE_REWARD_POOL: "create-reward-pool-event",
  STAKE_EVENT: "stake-event",
  UN_STAKE_EVENT: "un-stake-event",
  CREATE_TIER_POOL_EVENT: "create-tier-pool-event",
  CLAIM_REWARD_EVENT: "claim-reward-event",
  WITHDRAW_FUN: "withdraw-fun",
  REACTIVE_USER: "reactive-user",
  INACTIVE_USER: "inactive-user",
  UPDATE_ADMIN: "update-admin",
  PURCHASE_SUCCESS: "purchase-success",
  PURCHASE_FAILED: "purchase-failed",
  CLAIM_SUCCESS: "claim-success",
  CLAIM_FAILED: "claim-failed",
};

export const COMMON_MESSAGE = {
  CREATE_SUCCESS_TXT: "Created successfully",
  UPDATE_SUCCESS_TXT: "Updated successfully",
  DELETE_SUCCESS_TXT: "Deleted successfully",
};

export const SIGNER_RESPONSE = {
  SECRET_KEY_IN_VALID: "Secret key is invalid",
};

export const SYSTEM_WALLET_RESPONSE = {
  SYSTEM_WALLET_IN_VALID: "Secret key is invalid",
};

export const WEBHOOK_EXCEPTION = {
  MAX_RETRY: "Max retry webhook",
};

export enum DbErrorCode {
  E11000 = 11000, // in error duplicate an unique value
}

export const AllocationTypeTier = "Guaranteed";

export const TIER_NULL = {
  tierNumber: null,
  name: {
    en: "No tier",
    jp: "ティアなし",
    cn: "没有等级",
  },
  stakingPeriod: 0,
  stakingQuantity: 0,
};

export const PURCHASE_F_NFT_RESPONSE = {
  USER_WALLET_NOT_EXIST: "User wallet not exist in whitelist of pool",
  REMAIN_AMOUNT_NOT_ENOUGH: "Remaining not enough",
  VALIDATE_DATA_PURCHASE_ERROR: "Validate data purchase f-nft error",
  AMOUNT_GREATER_0: "Amount must be greater than 0",
  POOL_IS_NOT_OPEN_SELL: "The Purchase period will start soon",
  POOL_IS_SOLD: "The Purchase period has ended",
  HAS_UPDATED: "purchase history has updated",
  REQUIRE_GAS: "requireGasPurchase",
};
export const CLAIM_RESPOND = {
  AMOUNT_GREATER_THAN_PURCHASE: "amount is greater than purchase",
  REWARD_POOL_NOT_OPEN: "reward pool not open",
  AMOUNT_GREATER_THAN_0: "amount is greater than 0",
  HAS_UPDATED: "reward history has updated",
  REQUIRE_GAS: "requireGasClaim",
};
export enum PURCHASE_STATUS {
  PURCHASE_PROCESSING = 0,
  PURCHASE_SUCCESS = 1,
  PURCHASE_FAIL = -1,
}

// constants: status of action purchase & claim in pool gas less
export enum TRANSACTION_PAID_GAS_STATUS {
  PAID_SUCCESS = "success",
  PAID_PENDING = "pending",
  PAID_PROCESSING = "processing",
}

export enum CLAIM_STATUS {
  CLAIM_PROCESSING = 0,
  CLAIM_SUCCESS = 1,
  CLAIM_FAIL = -1,
}

export enum TieringPoolStatus {
  ON = 1,
  OFF = 0,
}

export const RECEIVE_WALLET_ADDRESS_MESSAGE = {
  CREATE_UPDATE_RECEIVE_WALLET_ADDRESS:
    "Create/Update receive wallet address successfully",
};

export const STAGE_DEFAULT_RESPONE_MESSAGE = {
  CREATE_STAGE_DEFAULT: "Create stage default success",
  STEP_NOT_FOUND: "Step timelines not found",
  EN_TIMELINE_REQUIRE: "EN is require",
  JP_TIMELINE_REQUIRE: "JP is require",
  CN_TIMELINE_REQUIRE: "CN is require",
  EN_TIMELINE_TOO_LONG: "En max 256 character",
  JP_TIMELINE_TOO_LONG: "JP max 256 character",
  CN_TIMELINE_TOO_LONG: "CN max 256 character",
};

export const StageDefaultValue = {
  timelines: [
    {
      en: "en",
      cn: "cn",
      jp: "jp",
    },
  ],
};

export enum TypeSign {
  claimReward = 2,
  purchaseFNFT = 1,
}

export const TOKEN_MESSAGE = {
  TOKEN_ADDRESS_IS_EXISTS: "Token address is exists",
  TOKEN_ADDRESS_NOT_FOUND: "Token address not found",
  TOKEN_ADDRESS_ALREADY_IN_POOL: "Token address already in pool",
};

export const TOKEN_STATUS = {
  TOKEN_ON: 1,
  TOKEN_OFF: 0,
};

export const MAX_SYSTEM_WALLET = {
  PURCHASE: 1,
  CLAIM: 1,
};

export const PRICE_CACHE = "price";

export const TTL_CACHE_DECIMALS = 2592000;
export const TTL_CACHE_PRICE = 300;

export const GAS_LIMIT = 0.01;

export const RETRY_INTERVAL = 300;

export const KEY_IMPORT_CSV = [
  "Binance Smart Chain Wallet Address (BEP20)",
  "Wallet address",
];

export const NUMBER_NFT_TO_OWNER = 500;
export const NUMBER_NFT_TO_ADD_NFT = 200;
