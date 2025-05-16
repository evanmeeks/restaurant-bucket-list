Pod::Spec.new do |spec|
  spec.name        = "hermes-engine"
  spec.version     = "0.13.0"
  spec.summary     = "Dummy hermes-engine for monorepo builds"
  spec.description = "This is a dummy pod spec that ensures builds will succeed without Hermes"
  spec.license     = "MIT"
  spec.author      = "Meta Platforms, Inc. and its affiliates"
  spec.source      = { :git => "https://github.com/facebook/react-native.git", :tag => "v#{spec.version}" }
  spec.platforms   = { :ios => "13.4" }
  spec.prepare_command = ""
end
