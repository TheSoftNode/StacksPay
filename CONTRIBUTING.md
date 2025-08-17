# Contributing to sBTC Payment Gateway

We're excited to have you contribute to this open-source sBTC payment gateway! This project was built for the Stacks Builder Competition and aims to make Bitcoin payments accessible to everyone.

## 🎯 **Project Goals**

- **Inclusivity**: Make Bitcoin payments accessible to both Stacks veterans and newcomers
- **Developer Experience**: Provide a Stripe-like API for easy integration
- **Production Quality**: Enterprise-grade code that can be used in real applications
- **Community First**: Built by the community, for the community

## 🚀 **Quick Setup for Contributors**

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Setup Steps

1. **Fork the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/sbtc-payment-gateway
   cd sbtc-payment-gateway
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   # Fill in your MongoDB URL and other required variables
   ```

4. **Setup database**

   ```bash
   npm run setup-db
   ```

5. **Run development server**

   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## 🛠️ **Development Guidelines**

### **Code Style**

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Meaningful variable names and comments
- Error handling for all external API calls

### **Architecture Principles**

- **Service Layer**: All business logic in `/lib/services/`
- **Models**: Database schemas in `/models/`
- **API Routes**: RESTful design in `/app/api/`
- **Components**: Reusable UI in `/components/`

### **Testing**

- Unit tests for all services
- Integration tests for API routes
- E2E tests for critical user flows

## 📝 **How to Contribute**

### **1. Bug Reports**

- Use the GitHub issue template
- Include steps to reproduce
- Provide environment details
- Include relevant logs/screenshots

### **2. Feature Requests**

- Open an issue first to discuss
- Explain the use case and benefit
- Consider backwards compatibility

### **3. Code Contributions**

#### **Small Changes (Bug fixes, typos)**

- Fork → Make changes → Submit PR

#### **Large Changes (New features)**

1. Open an issue to discuss
2. Get approval from maintainers
3. Fork and create feature branch
4. Implement with tests
5. Submit PR with detailed description

### **4. Documentation**

- Update relevant documentation
- Include code examples
- Keep language clear and beginner-friendly

## 🎭 **Types of Contributions Needed**

### **High Priority**

- 🔐 Security improvements
- 🐛 Bug fixes
- 📚 Documentation improvements
- 🧪 Test coverage expansion

### **Medium Priority**

- ✨ New payment methods
- 🎨 UI/UX improvements
- 🌐 Internationalization
- 📊 Analytics features

### **Community Features**

- 🐦 Social media integrations
- 📱 Mobile optimizations
- 🔌 Plugin development (WooCommerce, Shopify)
- 🎮 Gaming integrations

## 📋 **Pull Request Process**

### **Before Submitting**

- [ ] Tests pass (`npm test`)
- [ ] Code lints (`npm run lint`)
- [ ] Documentation updated
- [ ] Self-review completed

### **PR Template**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing

- [ ] Existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots (if applicable)

Include before/after screenshots

## Notes

Any additional context or considerations
```

### **Review Process**

1. Automated checks must pass
2. At least one maintainer review
3. Address feedback promptly
4. Merge by maintainer

## 🌟 **Recognition**

### **Contributors**

All contributors will be:

- Listed in our README
- Mentioned in release notes
- Invited to our Discord community
- Given priority support

### **Hackathon Bonus**

Contributors during the hackathon period get:

- Special recognition in submission
- Priority for post-hackathon development
- Potential hiring opportunities

## 🤝 **Community Guidelines**

### **Be Respectful**

- Welcome newcomers
- Constructive feedback only
- Assume good intentions
- No discrimination of any kind

### **Be Helpful**

- Answer questions when you can
- Share knowledge freely
- Help with debugging
- Mentor new contributors

### **Stay Focused**

- Keep discussions on-topic
- Use appropriate channels
- Respect maintainer decisions
- Focus on technical merit

## 📞 **Getting Help**

### **For Contributors**

- **Discord**: #sbtc-payment-gateway channel
- **GitHub Discussions**: For general questions
- **Issues**: For specific bugs/features

### **For Users**

- **Documentation**: `/docs` in the app
- **API Reference**: `/docs/api`
- **Examples**: `/examples` directory

## 🎉 **First-Time Contributors**

Look for issues labeled:

- `good first issue` - Easy to get started
- `help wanted` - We need community help
- `documentation` - Great for non-coders
- `beginner-friendly` - No advanced knowledge needed

## 📊 **Project Metrics**

We track:

- Code coverage (aim for >80%)
- Performance benchmarks
- User experience metrics
- Community engagement

---

**Thank you for contributing to the future of Bitcoin payments!** 🚀

Every contribution, no matter how small, helps make Bitcoin more accessible to everyone. Let's build something amazing together! ✨
