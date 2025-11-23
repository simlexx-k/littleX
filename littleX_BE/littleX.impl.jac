
import datetime;
import hashlib;
import secrets;

impl search_tweets {
    transformed = vectorizer.fit_transform([query, tweet]);
    similarity = cosine_similarity(transformed[0], transformed[1])[0];
    return similarity;
}

impl hash_password {
    return hashlib.sha256(password.encode("utf-8")).hexdigest();
}

impl verify_password {
    if not hashed {
        return False;
    }
    return hash_password(password) == hashed;
}

impl generate_token {
    return secrets.token_urlsafe(32);
}

impl generate_verification_code {
    code = secrets.randbelow(1000000);
    return str(code).zfill(6);
}

impl make_expiry {
    now = datetime.datetime.utcnow();
    future = now + datetime.timedelta(hours=hours);
    return {
        "iso": future.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "timestamp": future.timestamp()
    };
}

impl parse_iso_timestamp {
    if not timestamp {
        return None;
    }
    return datetime.datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ");
}

impl build_user_payload {
    profile_ref = None;
    if user_node.profile_id {
        try {
            profile_ref = &user_node.profile_id;
        } except Exception {
            profile_ref = None;
        }
    }
    profile_id = profile_ref and jid(profile_ref) or user_node.profile_id or "";
    return {
        "id": jid(user_node),
        "email": user_node.email,
        "root_id": profile_id,
        "is_activated": user_node.verified,
        "is_admin": False,
        "expiration": float(user_node.expiration),
        "state": user_node.state,
        "avatar": user_node.avatar or "https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png",
    };
}

def extract_hashtags(text: str) -> list {
    tags = [];
    for word in text.split() {
        if word.startswith("#") and len(word) > 1 {
            clean = word.strip(".,!?").lower();
            if clean {
                tags.append(clean);
            }
        }
    }
    return tags;
}

impl Profile.update {
    self.username = self.new_username;
    report self;
}

impl Profile.get {
        follwers=[{"id": jid(i), "username": i.username} for i in [self-->(`?Profile)]];
        report {"user": self, "followers": follwers};
    }

impl Profile.follow{
        current_profile = [root-->(`?Profile)];
        current_profile[0] +>:Follow():+> self;
        report self;
    }

impl Profile.un_follow {
        current_profile = [root-->(`?Profile)];
        follow_edge = [edge current_profile[0] ->:Follow:-> self];
        del follow_edge[0];
        report self;
    }

impl Tweet.update {
        self.content = self.updated_content;
        report self;
    }

impl Tweet.delete {
        del self;
        disengage;
    }

impl Tweet.like_tweet {
        current_profile = [root-->(`?Profile)];
        self +>:Like():+> current_profile[0];
        report self;
    }

impl Tweet.remove_like {
        current_profile = [root-->(`?Profile)];
        like_edge = [edge self ->:Like:-> current_profile[0]];
        del like_edge[0];
        report self;
    }

impl Tweet.comment {
        current_profile = [root-->(`?Profile)];
        comment_node = current_profile[0] +>:Post():+> Comment(content=self.content);
        grant(comment_node[0], level=ConnectPerm);
        self ++> comment_node[0];
        thread_nodes = [self->:ThreadFlow:->];
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S");
        if thread_nodes {
            thread_node = thread_nodes[0];
        } else {
            thread_node = self +>:ThreadFlow():+> ConversationThread(
                title=self.content[:60],
                participants=[current_profile[0].username],
                summary=self.content,
                engagement_score=1.0,
                last_activity=now
            );
            grant(thread_node[0], level=ConnectPerm);
            thread_node = thread_node[0];
        }
        if current_profile[0].username not in thread_node.participants {
            thread_node.participants.append(current_profile[0].username);
        }
        thread_node.engagement_score += 1.0;
        thread_node.summary = self.content;
        thread_node.last_activity = now;
        comment_node[0] +>:ThreadFlow():+> thread_node;
        metric_nodes = [root-->(`?EngagementMetric)];
        if metric_nodes {
            engagement_metric = metric_nodes[0];
        } else {
            engagement_metric = root +>:EngagementMetric():+> EngagementMetric();
            grant(engagement_metric[0], level=ConnectPerm);
            engagement_metric = engagement_metric[0];
        }
        engagement_metric.comments += 1;
        engagement_metric.updated_at = now;
        report comment_node[0];
    }

impl Tweet.get_info {
        return TweetInfo(
            username=[self<-:Post:<-][0].username,
            id=jid(self),
            content=self.content,
            embedding=self.embedding,
            likes=[i.username for i in [self->:Like:->]],
            comments=[{"username": [i<--(`?Profile)][0].username, "id": jid(i), "content": i.content} for i in [self-->(`?Comment)]],
            ai_assisted=self.ai_assisted
        );
    }

impl Tweet.get {
        tweet_info = self.get_info();
        similarity = search_tweets(self.search_query, tweet_info.content);
        self.results.append({"Tweet_Info": tweet_info, "similarity": similarity});
    }

impl Comment.update {
        self.content = self.updated_content;
        report self;
    }

impl Comment.delete {
        del self;
        disengage;
    }

impl visit_profile.visit_profile {
        visit [-->(`?Profile)] else {
            new_profile = here ++> Profile();
            grant(new_profile[0], level=ConnectPerm);
            visit new_profile;
        }
    }


impl get_profile.get_profile {
    current_user = None;
    if self.token {
        users = find_user_by_token(self.token);
        if users {
            current_user = users[0];
        }
    }

    if self.username {
        profiles = [];
        for node in [root --> (`?Profile)] {
            if node.username == self.username {
                profiles.append(node);
            }
        }
        if profiles {
            profile = profiles[0];
            followers = [];
            for p in [profile<-:Follow:<-] {
                followers.append(p.username);
            }
            report [{"user": {"id": jid(profile), "context": {"username": profile.username}}, "followers": followers}];
        } else {
            report [];
        }
    } else {
        # If no username provided, return current user's profile if authenticated
        if current_user and current_user.profile_username {
            profiles = [];
            for node in [root --> (`?Profile)] {
                if node.username == current_user.profile_username {
                    profiles.append(node);
                }
            }
            if profiles {
                profile = profiles[0];
                followers = [];
                for p in [profile<-:Follow:<-] {
                    followers.append(p.username);
                }
                report [{"user": {"id": jid(profile), "context": {"username": profile.username}}, "followers": followers}];
            } else {
                report [];
            }
        } else {
            # Fallback to returning all profiles if no username and not authenticated
            all_profiles = [];
            for profile in [root --> (`?Profile)] {
                followers = [];
                for p in [profile<-:Follow:<-] {
                    followers.append(p.username);
                }
                all_profiles.append({"user": {"id": jid(profile), "context": {"username": profile.username}}, "followers": followers});
            }
            report all_profiles;
        }
    }
}

impl load_user_profiles.load_profiles {
        self.profiles: list = [];

        for each_root in allroots() {
            profile = [each_root --> (`?Profile)][0];
            self.profiles.append(
                {"name": profile.username, "id": jid(profile)}
            );
        }
    }

impl load_user_profiles.report_profiles {
    report self.profiles;
}

def find_user_by_email(email: str) -> list;

impl find_user_by_email {
    key = email.strip().lower();
    return [user for user in [root --> (`?UserAccount)] if user.email == key];
}

def find_user_by_code(code: str) -> list;

impl find_user_by_code {
    key = code.strip();
    return [user for user in [root --> (`?UserAccount)] if user.verification_code == key];
}

def find_user_by_token(token: str) -> list;

impl find_user_by_token {
    if not token {
        return [];
    }
    key = token.strip();
    return [user for user in [root --> (`?UserAccount)] if user.token == key];
}

def authenticate_user() -> UserAccount;
impl authenticate_user {
    # This function should be called at the start of walkers that need user context
    # It extracts the Bearer token from the request and validates it
    # For now, we'll return None since we don't have access to request headers in JAC impls
    # This needs to be handled at the walker level
    return None;
}

impl register_user.register {
    key = self.email.strip().lower();
    if not key or not self.password {
        self.result = {"error": "Email and password are required"};
        report [self.result];
        disengage;
    }

    existing = find_user_by_email(key);
    if existing {
        self.result = {"error": "Email already registered"};
        report [self.result];
        disengage;
    }

    username = self.username.strip() if self.username.strip() else key.split("@")[0];
    profile_nodes = root +>:Profile():+> Profile(username=username);
    grant(profile_nodes[0], level=ConnectPerm);

    password_hash = hash_password(self.password);
    token = generate_token();
    expiry = make_expiry(4);

    user_nodes = root +>:UserAccount():+> UserAccount(email=key, password_hash=password_hash);
    user_nodes[0].token = token;
    user_nodes[0].token_expiry = expiry["iso"];
    user_nodes[0].expiration = expiry["timestamp"];
    user_nodes[0].profile_id = jid(profile_nodes[0]);
    user_nodes[0].profile_username = username;
    grant(user_nodes[0], level=ConnectPerm);

    self.result = {
        "token": token,
        "expires_at": expiry["iso"],
        "user": build_user_payload(user_nodes[0])
    };
    report [self.result];
}

impl login_user.login {
    print("[DEBUG] login_user.login called");
    key = self.email.strip().lower();
    print(f"[DEBUG] email: {key}");
    if not key or not self.password {
        print("[DEBUG] Missing email or password");
        self.result = {"error": "Email and password are required"};
        report [self.result];
        disengage;
    }

    users = find_user_by_email(key);
    print(f"[DEBUG] Found {len(users) if users else 0} users");
    if not users {
        print("[DEBUG] No users found");
        self.result = {"error": "Invalid email or password"};
        report [self.result];
        disengage;
    }

    user = users[0];
    print("[DEBUG] Verifying password");
    if not verify_password(self.password, user.password_hash) {
        print("[DEBUG] Password verification failed");
        self.result = {"error": "Invalid email or password"};
        report [self.result];
        disengage;
    }

    print("[DEBUG] Password verified, generating token");
    token = generate_token();
    expiry = make_expiry(4);
    user.token = token;
    user.token_expiry = expiry["iso"];
    user.expiration = expiry["timestamp"];
    user.verified = True;

    self.result = {
        "token": token,
        "expires_at": expiry["iso"],
        "user": build_user_payload(user)
    };
    print(f"[DEBUG] About to report result: {self.result}");
    report [self.result];
    print("[DEBUG] Report called");
}

impl change_password.change {
    key = self.email.strip().lower();
    users = find_user_by_email(key);
    if not users {
        self.result = {"error": "User not found"};
        report [self.result];
        return;
    }

    user = users[0];
    if not verify_password(self.current_password, user.password_hash) {
        self.result = {"error": "Current password is incorrect"};
        report [self.result];
        return;
    }

    user.password_hash = hash_password(self.new_password);
    self.result = {"success": True};
    report [self.result];
}

impl send_verification_code.send {
    key = self.email.strip().lower();
    users = find_user_by_email(key);
    if not users {
        self.result = {"error": "User not found"};
        report [self.result];
        return;
    }

    user = users[0];
    code = generate_verification_code();
    expiry = make_expiry(0.25);
    user.verification_code = code;
    user.verification_expires = expiry["iso"];

    self.result = {"code": code, "expires_at": expiry["iso"]};
    report [self.result];
}

impl verify_user.verify {
    key = self.email.strip().lower();
    users = find_user_by_email(key);
    if not users {
        self.result = {"error": "User not found"};
        report [self.result];
        return;
    }

    user = users[0];
    if user.verification_code != self.code {
        self.result = {"error": "Invalid verification code"};
        report [self.result];
        return;
    }

    expires_at = parse_iso_timestamp(user.verification_expires);
    if not expires_at or datetime.datetime.utcnow() > expires_at {
        self.result = {"error": "Verification code expired"};
        report [self.result];
        return;
    }

    user.verified = True;
    user.verification_code = "";
    user.verification_expires = "";

    self.result = {"success": True, "user": build_user_payload(user)};
    report [self.result];
}

impl forgot_password.remind {
    key = self.email.strip().lower();
    users = find_user_by_email(key);
    if not users {
        self.result = {"error": "User not found"};
        report [self.result];
        return;
    }

    user = users[0];
    code = generate_verification_code();
    expiry = make_expiry(0.25);
    user.verification_code = code;
    user.verification_expires = expiry["iso"];

    self.result = {"code": code, "expires_at": expiry["iso"]};
    report [self.result];
}

impl reset_password.reset {
    users = find_user_by_code(self.code);
    if not users {
        self.result = {"error": "Invalid reset code"};
        report [self.result];
        return;
    }

    user = users[0];
    if user.verification_code != self.code {
        self.result = {"error": "Invalid reset code"};
        report [self.result];
        return;
    }

    expires_at = parse_iso_timestamp(user.verification_expires);
    if not expires_at or datetime.datetime.utcnow() > expires_at {
        self.result = {"error": "Reset code expired"};
        report [self.result];
        return;
    }

    user.password_hash = hash_password(self.new_password);
    user.verification_code = "";
    user.verification_expires = "";

    self.result = {"success": True};
    report [self.result];
}

impl create_tweet.tweet {
    if not self.token {
        report [{"success": False, "error": "Token required"}];
        disengage;
    }

    users = find_user_by_token(self.token);
    if not users {
        report [{"success": False, "error": "Invalid token"}];
        disengage;
    }

    user = users[0];
    if not user.profile_username {
        report [{"success": False, "error": "Profile not found"}];
        disengage;
    }

    # Find the profile node
    profile_node = None;
    for prof in [root --> (`?Profile)] {
        if prof.username == user.profile_username {
            profile_node = prof;
            break;
        }
    }
    
    if not profile_node {
        report [{"success": False, "error": "Profile node not found"}];
        disengage;
    }

    # Create the tweet
    embedding = vectorizer.fit_transform([self.content]).toarray().tolist();
    tweet_node = profile_node +>:Post():+> Tweet(
        content=self.content,
        embedding=embedding,
        ai_assisted=self.ai_assisted
    );
    grant(tweet_node[0], level=ConnectPerm);
    
    # Process hashtags
    words = self.content.split();
    for word in words {
        if word.startswith("#") and len(word) > 1 {
            clean_word = word.strip(".,!?");
            normalized_tag = clean_word.lower();
            
            # Find or create topic
            topic_node = None;
            for topic in [root-->(`?Topic)] {
                if topic.name == normalized_tag {
                    topic_node = topic;
                    break;
                }
            }
            
            if not topic_node {
                new_topic = root +>:TopicAffinity():+> Topic(name=normalized_tag);
                new_topic[0].mention_count = 0;
                grant(new_topic[0], level=ConnectPerm);
                topic_node = new_topic[0];
            }
            
            
            
            
            topic_node.mention_count += 1;
            topic_node.last_updated = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S");
            tweet_node[0] +>:TopicAffinity():+> topic_node;
        }
    }
    
    # Update engagement metrics
    metric_node = None;
    for metric in [root-->(`?EngagementMetric)] {
        metric_node = metric;
        break;
    }
    
    if not metric_node {
        new_metric = root ++> EngagementMetric();
        grant(new_metric[0], level=ConnectPerm);
        metric_node = new_metric[0];
    }
    
    
    metric_node.threads += 1;
    metric_node.updated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S");
    report tweet_node;
}
impl load_feed.load {
        current_user = None;
        if self.token {
            users = find_user_by_token(self.token);
            if users {
                current_user = users[0];
            }
        }

        if current_user and current_user.profile_username {
            user_profiles = [];
            for node in [root --> (`?Profile)] {
                if node.username == current_user.profile_username {
                    user_profiles.append(node);
                }
            }
            if user_profiles {
                user_profile = user_profiles[0];
                visit [user_profile-->(`?Tweet)];
                for followed_profile in [user_profile->:Follow:->(`?Profile)] {
                    visit [followed_profile-->(`?Tweet)];
                }
            } else {
                # Fallback to all tweets if profile not found
                visit [-->(`?Tweet)];
            }
        } else {
            # Not authenticated, show all tweets
            visit [-->(`?Tweet)];
        }
    }

impl load_feed.process_tweet {
    if self.search_query {
        # Simple search for now (contains), shall use vector search if available
        if self.search_query.lower() in here.content.lower() {
             self.results.append({"Tweet_Info": here.get_info(), "similarity": 1.0});
        }
    } else {
        self.results.append({"Tweet_Info": here.get_info(), "similarity": 1.0});
    }
}

impl load_feed.report_feed {
        self.results.sort(key=lambda x:dict:x['similarity'], reverse=True);
        report self.results;
}

impl detect_trending_topics.analyze {
    tag_counts = {};
    sample_map = {};
    for each_root in allroots() {
        tweets = [each_root --> (`?Tweet)];
        for tweet in tweets {
            for tag in extract_hashtags(tweet.content) {
                tag_counts[tag] = tag_counts.get(tag, 0) + 1;
                if tag not in sample_map {
                    sample_map[tag] = tweet.content[:120];
                }
            }
        }
    }
    for tag in tag_counts.keys() {
        count = tag_counts[tag];
        self.results.append({
            "topic": tag,
            "mentions": count,
            "score": float(count),
            "sample": sample_map.get(tag, "")
        });
    }
}

impl detect_trending_topics.report_trends {
    self.results.sort(key=lambda x:dict:x['score'], reverse=True);
    report self.results[:10];
}

impl discover_communities.analyze {
    topic_authors = {};
    topic_tweets = {};
    for each_root in allroots() {
        tweets = [each_root --> (`?Tweet)];
        for tweet in tweets {
            author = [tweet<-:Post:<-][0];
        for tag in extract_hashtags(tweet.content) {
            if tag not in topic_authors {
                topic_authors[tag] = {};
            }
            topic_authors[tag][jid(author)] = author;
            if tag not in topic_tweets {
                topic_tweets[tag] = [];
            }
            topic_tweets[tag].append(tweet);
        }
        }
    }
    for tag in topic_authors.keys() {
        members = topic_authors[tag];
        if len(members) < self.min_members {
            continue;
        }
        all_communities = [root-->(`?Community)];
        community_node = None;
        for node in all_communities {
            if node.name == f"{tag.title()} Circle" {
                community_node = node;
                break;
            }
        }
        if not community_node {
            new_community = root +>:Community():+> Community(
                name=f"{tag.title()} Circle",
                description=f"Community around #{tag}",
                tags=[tag],
                member_count=len(members),
                engagement_trend=len(topic_tweets.get(tag, [])),
                created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            );
            grant(new_community[0], level=ConnectPerm);
            community_node = new_community[0];
        }
        combined_tags = community_node.tags + [tag];
        unique_tags = [];
        for entry in combined_tags {
            if entry not in unique_tags {
                unique_tags.append(entry);
            }
        }
        community_node.tags = unique_tags;
        community_node.member_count = len(members);
        community_node.engagement_trend = len(topic_tweets.get(tag, []));
        existing_members = [community_node->:Membership:->];
        for member_profile in members.values() {
            if member_profile not in existing_members {
                community_node +>:Membership():+> member_profile;
            }
        }
        self.results.append({
            "community": community_node.name,
            "topic": tag,
            "members": len(members),
            "engagement": community_node.engagement_trend
        });
    }
}

impl discover_communities.report_discoveries {
    self.results.sort(key=lambda x:dict:x['engagement'], reverse=True);
    report self.results;
}

impl thread_insights.analyze {
    thread_candidates = [root-->(`?ConversationThread)];
    for thread in thread_candidates {
        if self.thread_id and jid(thread) != self.thread_id {
            continue;
        }
        self.participants = thread.participants;
        self.summary = thread.summary or thread.title;
        self.engagement_score = thread.engagement_score;
        self.results.append({
            "thread": thread.title,
            "participants": thread.participants,
            "engagement": thread.engagement_score,
            "last_activity": thread.last_activity,
            "summary": thread.summary or "No summary yet"
        });
    }
    if not self.results {
        self.results.append({"thread": "none", "engagement": 0.0, "summary": "No threads found yet", "participants": []});
    }
}

impl thread_insights.report_summary {
    self.results.sort(key=lambda x:dict:x['engagement'], reverse=True);
    report self.results;
}

# AI Feature Implementations
impl generate_ai_suggestions {
    if len(context) < 3 {
        return [];
    }
    
    tone_instruction = TONE_PROMPTS.get(tone, TONE_PROMPTS["casual"]);
    prompt = f"""You are a helpful social media writing assistant. Generate {num} tweet suggestions for: {context}

Style: {tone_instruction}

Return ONLY a JSON array: [{{"text": "suggestion", "confidence": 0.9}}]""";

    print(f"[AI] Generating suggestions for: {context[:50]}...");
    try {
        response = completion(
            model="openrouter/google/gemini-2.5-flash-lite",
            messages=[{"role": "user", "content": prompt}],
            api_key=OPENROUTER_API_KEY,
            temperature=0.8,
            max_tokens=2000
        );
        content = response.choices[0].message.content;
    } except Exception as e {
        print(f"[AI] Primary model failed: {e}. Trying fallback to google/gemini-2.0-flash-exp:free...");
        try {
            response = completion(
                model="openrouter/google/gemini-2.0-flash-exp:free",
                messages=[{"role": "user", "content": prompt}],
                api_key=OPENROUTER_API_KEY,
                temperature=0.8,
                max_tokens=2000
            );
            content = response.choices[0].message.content;
        } except Exception as e2 {
            print(f"[AI] Fallback failed: {e2}");
            return [];
        }
    }

    try {
        # Clean up markdown code blocks if present
        if "```json" in content {
            content = content.replace("```json", "").replace("```", "");
        }
        suggestions = json.loads(content);
        return suggestions[:num];
    } except Exception as e {
        print(f"[AI] Error parsing response: {e}");
        return [];
    }
}

impl generate_ai_hashtags {
    if len(content) < 10 {
        return [];
    }
    
    prompt = f"""Generate {num} hashtags for: {content}

Return ONLY a JSON array: [{{"tag": "#example", "relevance": 0.95}}]""";

    print(f"[AI] Generating hashtags for: {content[:50]}...");
    try {
        response = completion(
            model="openrouter/google/gemini-2.5-flash-lite",
            messages=[{"role": "user", "content": prompt}],
            api_key=OPENROUTER_API_KEY,
            temperature=0.7,
            max_tokens=2000
        );
        content = response.choices[0].message.content;
    } except Exception as e {
        print(f"[AI] Primary model failed: {e}. Trying fallback...");
        try {
            response = completion(
                model="openrouter/google/gemini-2.0-flash-exp:free",
                messages=[{"role": "user", "content": prompt}],
                api_key=OPENROUTER_API_KEY,
                temperature=0.7,
                max_tokens=2000
            );
            content = response.choices[0].message.content;
        } except Exception as e2 {
            print(f"[AI] Fallback failed: {e2}");
            return [];
        }
    }

    try {
        if "```json" in content {
            content = content.replace("```json", "").replace("```", "");
        }
        hashtags = json.loads(content);
        return hashtags[:num];
    } except Exception as e {
        print(f"[AI] Error: {e}");
        return [];
    }
}

impl improve_ai_text {
    if len(text) < 5 {
        return {"original": text, "improved": text, "changes": []};
    }
    
    tone_instruction = TONE_PROMPTS.get(style, TONE_PROMPTS["casual"]);
    prompt = f"""Improve this text: {text}

Style: {tone_instruction}

Return ONLY a JSON object: {{"original": "...", "improved": "...", "changes": ["change1"]}}""";

    print(f"[AI] Improving text: {text[:50]}...");
    try {
        response = completion(
            model="openrouter/google/gemini-2.5-flash-lite",
            messages=[{"role": "user", "content": prompt}],
            api_key=OPENROUTER_API_KEY,
            temperature=0.7,
            max_tokens=2000
        );
        content = response.choices[0].message.content;
    } except Exception as e {
        print(f"[AI] Primary model failed: {e}. Trying fallback...");
        try {
            response = completion(
                model="openrouter/google/gemini-2.0-flash-exp:free",
                messages=[{"role": "user", "content": prompt}],
                api_key=OPENROUTER_API_KEY,
                temperature=0.7,
                max_tokens=2000
            );
            content = response.choices[0].message.content;
        } except Exception as e2 {
            print(f"[AI] Fallback failed: {e2}");
            return {"original": text, "improved": text, "changes": ["Error generating improvement"]};
        }
    }

    try {
        if "```json" in content {
            content = content.replace("```json", "").replace("```", "");
        }
        improvement = json.loads(content);
        return improvement;
    } except Exception as e {
        print(f"[AI] Error: {e}");
        return {"original": text, "improved": text, "changes": ["Error parsing response"]};
    }
}

impl autocomplete_ai {
    if len(partial) < 3 {
        return [];
    }
    
    prompt = f"""Complete this text {num} ways: {partial}

Return ONLY a JSON array: ["completion 1", "completion 2"]""";

    print(f"[AI] Autocompleting: {partial[:50]}...");
    try {
        response = completion(
            model="openrouter/google/gemini-2.5-flash-lite",
            messages=[{"role": "user", "content": prompt}],
            api_key=OPENROUTER_API_KEY,
            temperature=0.8,
            max_tokens=2000
        );
        content = response.choices[0].message.content;
    } except Exception as e {
        print(f"[AI] Primary model failed: {e}. Trying fallback...");
        try {
            response = completion(
                model="openrouter/google/gemini-2.0-flash-exp:free",
                messages=[{"role": "user", "content": prompt}],
                api_key=OPENROUTER_API_KEY,
                temperature=0.8,
                max_tokens=2000
            );
            content = response.choices[0].message.content;
        } except Exception as e2 {
            print(f"[AI] Fallback failed: {e2}");
            return [];
        }
    }

    try {
        if "```json" in content {
            content = content.replace("```json", "").replace("```", "");
        }
        completions = json.loads(content);
        return completions[:num];
    } except Exception as e {
        print(f"[AI] Error: {e}");
        return [];
    }
}

impl ai_suggest_content.generate {
    print(f"[Walker] ai_suggest_content: context='{self.context[:30]}...', tone='{self.tone}'");
    suggestions = generate_ai_suggestions(self.context, self.tone, self.num_suggestions);
    print(f"[Walker] Returning {len(suggestions)} suggestions");
    report suggestions;
}

impl ai_generate_hashtags.generate {
    print(f"[Walker] ai_generate_hashtags: content='{self.content[:30]}...'");
    hashtags = generate_ai_hashtags(self.content, self.num_hashtags);
    print(f"[Walker] Returning {len(hashtags)} hashtags");
    report hashtags;
}

impl ai_improve_text.improve {
    print(f"[Walker] ai_improve_text: text='{self.text[:30]}...', style='{self.style}'");
    improvement = improve_ai_text(self.text, self.style);
    print(f"[Walker] Text improved");
    report improvement;
}

impl ai_autocomplete.complete {
    print(f"[Walker] ai_autocomplete: partial='{self.partial[:30]}...'");
    completions = autocomplete_ai(self.partial, self.num_suggestions);
    print(f"[Walker] Returning {len(completions)} completions");
    report completions;
}
impl update_profile.update_profile_entry {
    current_user = None;
    if self.token {
        users = find_user_by_token(self.token);
        if users {
            current_user = users[0];
        }
    }

    if not current_user {
        report [{"error": "Unauthorized"}];
        disengage;
        return;
    }

    # Check if username is already taken
    # We need to check all profiles
    is_taken = False;
    for profile in [root --> (`?Profile)] {
        if profile.username.lower() == self.new_username.lower() {
            is_taken = True;
            break;
        }
    }

    if is_taken {
        report [{"error": "Username already exists"}];
        disengage;
        return;
    }

    # Find the user's profile
    user_profile = None;
    if current_user.profile_username {
        for profile in [root --> (`?Profile)] {
            if profile.username == current_user.profile_username {
                user_profile = profile;
                break;
            }
        }
    }

    if user_profile {
        user_profile.username = self.new_username;
        current_user.profile_username = self.new_username;
        report [{"id": jid(user_profile), "context": {"username": user_profile.username}}];
    } else {
        report [{"error": "Profile not found"}];
    }
}
