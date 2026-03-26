import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type ChecklistItem = {
    id : Nat;
    text : Text;
    isChecked : Bool;
    order : Nat;
  };

  module ChecklistItem {
    public func compareByOrder(a : ChecklistItem, b : ChecklistItem) : Order.Order {
      Nat.compare(a.order, b.order);
    };
  };

  public type Schedule = {
    departureTime : Text;
    destinationLabel : Text;
    isEnabled : Bool;
  };

  public type LockerStatus = {
    isLocked : Bool;
  };

  public type UserData = {
    checklist : List.List<ChecklistItem>;
    schedule : ?Schedule;
    lockerStatus : LockerStatus;
    nextItemId : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let users = Map.empty<Principal, UserData>();

  func getOrCreateUserData(user : Principal) : UserData {
    switch (users.get(user)) {
      case (?data) { data };
      case (null) {
        let newData = {
          checklist = List.empty<ChecklistItem>();
          schedule = null;
          lockerStatus = { isLocked = true };
          nextItemId = 1;
        };
        users.add(user, newData);
        newData;
      };
    };
  };

  func getUserDataReadOnly(user : Principal) : UserData {
    switch (users.get(user)) {
      case (?data) { data };
      case (null) {
        {
          checklist = List.empty<ChecklistItem>();
          schedule = null;
          lockerStatus = { isLocked = true };
          nextItemId = 1;
        };
      };
    };
  };

  // User Profile Operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Checklist Operations
  public shared ({ caller }) func addItem(text : Text, order : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add checklist items");
    };

    let userData = getOrCreateUserData(caller);
    let newItem : ChecklistItem = {
      id = userData.nextItemId;
      text;
      isChecked = false;
      order;
    };

    userData.checklist.add(newItem);
    let updatedUserData = {
      checklist = userData.checklist;
      schedule = userData.schedule;
      lockerStatus = userData.lockerStatus;
      nextItemId = userData.nextItemId + 1;
    };
    users.add(caller, updatedUserData);
  };

  public shared ({ caller }) func removeItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove checklist items");
    };

    let userData = getOrCreateUserData(caller);
    let filteredChecklist = userData.checklist.filter(
      func(item) { item.id != id }
    );
    let updatedUserData = {
      checklist = filteredChecklist;
      schedule = userData.schedule;
      lockerStatus = userData.lockerStatus;
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
  };

  public shared ({ caller }) func toggleItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle checklist items");
    };

    let userData = getOrCreateUserData(caller);
    let updatedChecklist = userData.checklist.map<ChecklistItem, ChecklistItem>(
      func(item) {
        if (item.id == id) {
          {
            id = item.id;
            text = item.text;
            isChecked = not item.isChecked;
            order = item.order;
          };
        } else {
          item;
        };
      }
    );
    let updatedUserData = {
      checklist = updatedChecklist;
      schedule = userData.schedule;
      lockerStatus = userData.lockerStatus;
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
  };

  public query ({ caller }) func getItems() : async [ChecklistItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get checklist items");
    };

    let userData = getUserDataReadOnly(caller);
    userData.checklist.toArray().sort<ChecklistItem>(
      ChecklistItem.compareByOrder
    );
  };

  public shared ({ caller }) func resetAllChecks() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset checklist");
    };

    let userData = getOrCreateUserData(caller);
    let uncheckedChecklist = userData.checklist.map<ChecklistItem, ChecklistItem>(
      func(item) {
        {
          id = item.id;
          text = item.text;
          isChecked = false;
          order = item.order;
        };
      }
    );
    let updatedUserData = {
      checklist = uncheckedChecklist;
      schedule = userData.schedule;
      lockerStatus = userData.lockerStatus;
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
  };

  // Schedule Operations
  public shared ({ caller }) func setSchedule(departureTime : Text, destinationLabel : Text, isEnabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set schedules");
    };

    let userData = getOrCreateUserData(caller);
    let newSchedule : Schedule = {
      departureTime;
      destinationLabel;
      isEnabled;
    };
    let updatedUserData = {
      checklist = userData.checklist;
      schedule = ?newSchedule;
      lockerStatus = userData.lockerStatus;
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
  };

  public query ({ caller }) func getSchedule() : async ?Schedule {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get schedules");
    };

    let userData = getUserDataReadOnly(caller);
    userData.schedule;
  };

  // Locker Operations
  public shared ({ caller }) func unlockLocker() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock lockers");
    };

    let userData = getOrCreateUserData(caller);
    let checklistArray = userData.checklist.toArray();

    // Check if checklist is empty or all items are checked
    let allChecked = checklistArray.all(
      func(item) { item.isChecked }
    );

    if (checklistArray.size() > 0 and not allChecked) {
      Runtime.trap("Cannot unlock: Not all checklist items are checked");
    };

    let updatedUserData = {
      checklist = userData.checklist;
      schedule = userData.schedule;
      lockerStatus = { isLocked = false };
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
    true;
  };

  public shared ({ caller }) func lockLocker() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lock lockers");
    };

    let userData = getOrCreateUserData(caller);
    let updatedUserData = {
      checklist = userData.checklist;
      schedule = userData.schedule;
      lockerStatus = { isLocked = true };
      nextItemId = userData.nextItemId;
    };
    users.add(caller, updatedUserData);
  };

  public query ({ caller }) func getLockerStatus() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get locker status");
    };

    let userData = getUserDataReadOnly(caller);
    userData.lockerStatus.isLocked;
  };
};
