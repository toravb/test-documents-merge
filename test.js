require('./bootstrap');
require('alpinejs');
require('jquery-ui-dist/jquery-ui')
let CKEditor = require('./modules/CKEditor');
let DocumentRequests = require('./modules/DocumentRequests');
let Slider = require('./modules/initSliderPost');
let LoginModal = require('./modules/modals/LoginModal')
let FollowersModal = require('./modules/modals/FollowersModal')
let FollowingModal = require('./modules/modals/FollowingModal')
let PostEvents = require('./modules/PostEvents')
let DocumentEvents = require('./modules/DocumentEvents')
let AccessModal = require('./modules/modals/AccessModal') test 123
let TasksModal = require('./modules/modals/TasksModal')
let NewsModal = require('./modules/modals/NewsModal')
let PusherFunctions = require('./modules/PusherFunctions')
let Cover = require('./modules/Cover')
let ContextMenu = require('./modules/ContextMenu')
let CommentEvents = require('./modules/CommentEvents')
let UserEvents = require('./modules/UserEvents')
let EditParentEvents = require('./modules/EditParentEvents')
let MenuModule = require('./modules/Menu')
let UserModals = require('./modules/UserModals')
let ListenerBody = require('./modules/ListenerBody')
let PaginationScroll = require('./modules/PaginationScroll')
let helper = require('./modules/helper').helper
let Tasks = require('./modules/Tasks')
const GenerateHTML = require('./modules/GenerateHTML')
// let diff = require('v-node-htmldiff');
// let dateFormat = require('dateformat')


window.PaginatorAndFilter = require('./modules/PaginatorAndFilter');

//window._ = require('lodash');
window.$ = window.jQuery = require('jquery');

console.log(process.env)
const node_host = process.env.MIX_NODE_HOST
const node_port = process.env.MIX_NODE_PORT
const node_scheme = process.env.MIX_NODE_SCHEME

const app_url = process.env.MIX_APP_URL,
    access_token = $('meta[name="csrf-token"]').attr("content");

// window.watchdog = null
window.contentTimer = null
window.ideasCKEditor = null
window.defaultDocumentCKEditor = null
// window.collaborationDocumentCKEditor = null
window.commentsRepository = null
window.commentThreadsData = null


let documentEditChannel = null
let documentHistory = null
let title = document.querySelector('.document-content #title')
let emojiBlock = null
const favorite = document.querySelector('.favorites')
const workspace = document.querySelector('.workspace')
const organizations = document.querySelector('.organizations')
const menu = document.querySelector('.menu');
const projectTextarea = document.querySelector('.project-textarea')
const postTextarea = document.querySelector('.post-textarea')
const wrapperCreateProject = document.querySelector('.wrapper-create-project')
const createProjectContainer = document.querySelector('.create-project-container')
const projectFormContainer = document.querySelector('.project-form-container')
const wpCreatePost = document.querySelector('.wrapper-create-post:not(.wrapper-edit-post)')
const postContainer = document.querySelector('.create-post-container')
const containerFeed = document.querySelector('.container-feed')
const documentContentLoad = document.querySelector('.document-content')
const organizationsContentBg = document.querySelector('.organizations-content-bg')
const srmDescriptionContentInnerNot = document.querySelector('.srm-description__content-inner:not(.git-current)')
const mainContent = document.querySelector('.main-content')
const menuDropDown = document.querySelector('.user-settings-drop')
const versionHistory = document.querySelector('#version-history')
const windowWidth = window.innerWidth
let windowResizeWidth

window.addEventListener('beforeunload', () => {
    if (window.contentTimer) {
        let editDocumentForm = document.querySelector('#edit-document-form')
        let defaultCKEditorContent = document.querySelector('#default-document-ckeditor')
        let collaborationCKEditorContent = document.querySelector('#collaboration-document-ckeditor')
        let documentContent = ''

        if (defaultCKEditorContent && window.defaultDocumentCKEditor) {
            documentContent = window.defaultDocumentCKEditor.getData()
        }
        if (collaborationCKEditorContent && window.collaborationDocumentCKEditor) {
            documentContent = window.collaborationDocumentCKEditor.getData()
        }

        if (documentContent.length) {
            let formData = new FormData()
            formData.append('_token', access_token)
            formData.append('_method', 'PUT')
            formData.append('document', documentContent)

            if (window.commentsRepository) {
                window.commentThreadsData = window.commentsRepository.getCommentThreads({
                    skipNotAttached: true,
                    skipEmpty: true,
                    toJSON: true
                });
                if (window.commentThreadsData && window.commentThreadsData.length) {
                    formData.append('document_comments', JSON.stringify(window.commentThreadsData))
                }
            }

            if (window.collaborationDocumentCKEditor) {
                formData.append('collaborative', 'true')
            }

            navigator.sendBeacon(editDocumentForm.dataset.updateDraft, formData)
        }
    }

    if (pusher && documentEditChannel && Laravel.documentId) {
        pusher.unsubscribe(`presence-updating-document${Laravel.documentId}`)
    }
})


// function connectToUpdatingDocumentChannel(documentId) {
//     documentEditChannel = pusher.subscribe(`presence-updating-document${documentId}`)
//     documentEditChannel.bind("pusher:subscription_succeeded", function () {
//         if (documentEditChannel.members.count === 1 && !window.defaultDocumentCKEditor) {
//             CKEditor.initDefaultDocumentCKEditor(BalloonEditor)
//         } else if (documentEditChannel.members.count === 2 && !window.collaborationDocumentCKEditor) {
//             pusher.bind('client-document-saved', () => {
//                 CKEditor.initCollaborationDocumentCKEditor(BalloonEditor)
//             });
//         } else {
//             CKEditor.initCollaborationDocumentCKEditor(BalloonEditor)
//         }
//         documentEditChannel.bind("pusher:member_added", memberAddedToDocumentChannel);
//
//     })
// }

// function memberAddedToDocumentChannel(member) {
//     if (documentEditChannel && documentEditChannel.members.count > 1) {
//         if (defaultDocumentCKEditor) {
//             new Promise((resolve => {
//                 DocumentRequests.sendUpdateContentRequest(access_token, true)
//                 resolve(true)
//             })).then(() => {
//                 CKEditor.refreshCloudDocument(access_token)
//             }).then(() => {
//                 CKEditor.destroyDefaultDocumentCKEditor()
//             }).then(() => {
//                 CKEditor.initCollaborationDocumentCKEditor(BalloonEditor)
//             }).then(() => {
//                 documentEditChannel.trigger('client-document-saved', '')
//             })
//         } else if (documentEditChannel.members.count === 2 && collaborationDocumentCKEditor) {
//             documentEditChannel.trigger('client-document-saved', '')
//         }
//     }
//
//     // alert('user ' + member.info.name + ' connected')
// }


$(document).ready(function () {

    try {
        const pusherFunctions = new PusherFunctions(Laravel, app_url, access_token)
        pusherFunctions.init()
    } catch (e) {
        console.log(e, 'Pusher')
    }

    Slider.initSlider()

    let documentEvents = new DocumentEvents(access_token)
    documentEvents.init()

    let cover = new Cover(access_token)
    cover.init()

    let postEvents = new PostEvents(access_token)
    postEvents.init()

    const listenerBody = new ListenerBody()
    listenerBody.init()

    const contextMenu = new ContextMenu(access_token, app_url)
    contextMenu.init()

    const paginationScroll = new PaginationScroll()
    paginationScroll.init()

    const commentEvents = new CommentEvents(access_token, app_url)
    commentEvents.init()

    const userEvents = new UserEvents(access_token, app_url)
    userEvents.init()

    const editParentEvents = new EditParentEvents(access_token, app_url)
    editParentEvents.init()

    const menuModule = new MenuModule(access_token, app_url)
    menuModule.init()

    const userModals = new UserModals(access_token, app_url)
    userModals.init()

    const newTasks = new Tasks()
    newTasks.init()

    const loginBtn = document.querySelector('#login-container')
    const loginPopup = document.querySelector('.modal-window')

    if (loginBtn && loginPopup) {
        let loginModal = new LoginModal(loginBtn, loginPopup, access_token)
        loginModal.init()
    }

    const followersBtn = document.querySelector('.link-followers')
    const followersPopup = document.querySelector('#popUp-followers-modal')

    if (followersBtn && followersPopup) {
        let followersModal = new FollowersModal(followersBtn, followersPopup, access_token)
        followersModal.init()
    }

    const followingBtn = document.querySelector('.link-following')
    const followingPopup = document.querySelector('#popUp-following-modal')

    if (followingBtn && followingPopup) {
        let followingModal = new FollowingModal(followingBtn, followingPopup, access_token)
        followingModal.init()
    }

    const accessesBtn = document.querySelector('.button-accesses-document')
    const accessesPopup = document.querySelector('#popUp-access-rights-modal')

    if (accessesBtn && accessesPopup) {
        let accessesModal = new AccessModal(accessesBtn, accessesPopup, access_token)
        accessesModal.init()
    }

    const tasksTrigger = document.querySelector('.openFilterTasks')
    const tasksModal = document.querySelector('#tasks-modal')

    if (tasksTrigger && tasksModal) {
        let tasksModalNew = new TasksModal(tasksTrigger, tasksModal)
        tasksModalNew.init()
    }

    const triggerNewsTask = document.querySelector('.openFilterNews')
    const newsModal = document.querySelector('#news_modal_filter')

    if(triggerNewsTask && newsModal) {
        let newsModalNew = new NewsModal(triggerNewsTask, newsModal)
        newsModalNew.init()
    }

    $('.cover-user-avatar form').submit(function (e) {
        let el = $(this)
        let data = new FormData(this)
        data.append('_token', access_token)

        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: data,
            processData: false,
            contentType: false
        }).done(function (response) {
            if(response.avatar) {
                let avatar_block = $('.user-avatar')
                let char = avatar_block.find('span')

                if (char.length !== 0){
                    char.remove()
                    el.before(`<button class="" id="avatar-delete" type="button">Delete</button>`)
                }
                avatar_block.css('background-image', 'url(' + response.avatar + ')')
            }
            console.log(response.status)
        }).fail(function (response) {
            console.log(response.status)
        })
        e.preventDefault()
        $(this)[0].reset()
    })

    $('#avatar-upload').click(function () {
        let form = $(this).parent().find('form')
        if (form.length !== 0) {
            const input = document.createElement('input');
            input.type = 'file';
            input.name = 'avatar'
            input.multiple = false
            input.hidden = true
            input.onchange = _ => {
                form.append(input)
                form.submit()
            };
            input.click();
        }
    })

    $(document).on('click', '#avatar-delete', function (e){
        let el = $(this)
        $.ajax({
            type: 'POST',
            url: app_url + '/user/avatar/delete',
            data: {_token: access_token},
            success: (data) => {
                let avatar_block = $('.user-avatar')
                avatar_block.css('background-image', 'none')
                avatar_block.append(`<span>${data.first_char}</span>`)
                $('#avatar-delete').remove()
            },
            error: (error) => {
                console.log(error)
            },
        })
    })

    $('.notification-block-rule-form .switch').change(function () {
        let el = $(this)

        $.ajax({
            type: 'POST',
            url: app_url + '/users/notifications/mute',
            data: {_token: access_token, subscription_id: el.attr('sub-id'), mute: el.is(':checked')},
            dataType: "JSON",
            success: (data) => {
                if (data.status) {
                    console.log(response.data.status)
                } else {
                    console.log(response.data.status)
                }
            },
            error: (error) => {
                console.log(error)
            },
        })

    })
    $(document).on('click', '.container__form_ .flexible-icon-network', function () {
        let el = $(this)

        let comment = [
            'comments',
            'facebook-comments',
            'reddit-comments'
        ]

        for (let i = 0; i < comment.length; i++) {
            let e = $('.' + comment[i] + el.attr('post-id'))
            if (comment[i] === el.attr('comment-data')) {
                if (e.hasClass('hide')) {
                    e.removeClass('hide')
                }
            } else {
                if (!e.hasClass('hide')) {
                    e.addClass('hide')
                }
            }
        }
    })

    $(document).on('click', '.message-reply-label', function (e) {
        let el = $(this)
        el.closest('.message-wrapper').find('.reply-comment').toggleClass('hide')
    })
    $(document).on('click', '.message-wrapper', function (e) {
        e.stopPropagation()
    })

    $('.cover-user-profile img#user-cover').click(function () {
        console.log($(this))
        $(this).parent().find('button.cover-upload').click()
    })

    $('.update-name-form').submit(function (e) {
        let el = $(this)
        $.ajax({
            type: 'PUT',
            url: el.attr('action'),
            data: {
                _token: access_token,
                country: el.find('input[name="country"]').val(),
                country_list_id: el.find('input[name="country"]').attr('data-id'),
                email: el.find('input[name="email"]').val(),
            }
        }).done(function (response) {
            console.log(response.data.status)
        }).fail(function (response) {
            console.log(response.data.status)
        })

        e.preventDefault()
    })

    $('.update-user-data-form').submit(function (e) {
        let el = $(this)
        $.ajax({
            type: 'PUT',
            url: el.attr('action'),
            data: {
                _token: access_token,
                nickname: el.find('input[name="nickname"]').val(),
                email: el.find('input[name="email"]').val(),
                old_password: el.find('input[name="old_password"]').val(),
                password: el.find('input[name="password"]').val(),
            }
        }).done(function (response) {
            console.log(response.data.status)
        }).fail(function (response) {
            console.log(response.data.status)
        })

        e.preventDefault()
        $(this)[0].reset()
    })


    $('.favorite-button').click(function () {
        let el = $(this)
        $.ajax({
            type: 'POST',
            url: app_url + '/favorites',
            data: {_token: access_token, document_id: el.attr('document-id')},
            dataType: "JSON",
            success: (data) => {
                let favorite = $('#favorites')
                if (data.destroyed) {
                    favorite.find('li.favorite[data-document-id="' + el.attr('document-id') + '"]').remove()
                } else {
                    favorite.append(data.html)
                }
                let count_favorites = favorite.find('li.favorite')
                if (count_favorites.length === 0) {
                    favorite.parent().addClass('hide')
                } else {
                    favorite.parent().removeClass('hide')
                }
                $('.favorite-button[document-id="'+el.attr('document-id')+'"]').find('.headerStar').toggleClass('yellowStar')

            },
            error: (error) => {
                console.log(error)
            },
        })
    })
    $('#create-wiki-form').submit(function (e) {
        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize()
        }).done(function (response) {
            console.log(response.data.status)
        }).fail(function (response) {
            console.log(response.data.status)
        })

        e.preventDefault()
        $(this)[0].reset()
    })

    $('#create-document-form').submit(function (e) {
        e.preventDefault()

        if (window.ideasCKEditor) {
            $('#create-document-form #document').val(window.ideasCKEditor.getData())
        }

        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize()
        }).done(function (response) {
            console.log(response.data.status)
            $('#create-document-form').trigger('reset')

            if (window.ideasCKEditor) {
                window.ideasCKEditor.setData('')
            }

        }).fail(function (response) {
            console.log(response.data.status)
        })
        $(this)[0].reset()
    })

    $('.document-edit-button').click(function () {
        $('.document-content').toggleClass('hide')
        $('.document-form-update').toggleClass('hide')
    })

    $('#edit-document-form').submit(function (e) {
        e.preventDefault()
        let block = $('.document-content')
        clearTimeout(window.contentTimer)
        DocumentRequests.sendUpdateContentRequest(access_token)
        block.toggleClass('show-draft')
    })

    $(document).on('submit', '.create-post-reaction-form', function (e) {
        let r = $(this)
        $.ajax({
            type: r.attr('method'),
            url: r.attr('action'),
            data: {
                _token: access_token,
                post_id: r.find('#post_id').val(),
                emoji_id: r.find('#emoji_id').val()
            },
            dataType: "JSON",
        }).done(function (response) {
            console.log(response.data.status)
        }).fail(function (response) {
            console.log(response.data.status)
        })

        e.preventDefault()
    })

    $(document).on('click', '.message-reply .message-reply-reaction', function (e) {
        e.stopPropagation()
        let parent = $(this).parent()
        parent.find('.message-reaction-smiles').toggleClass('scale')
    })

    $(document).on('submit', '.create-comment-reaction-form', function (e) {
        let r = $(this)
        $.ajax({
            type: r.attr('method'),
            url: r.attr('action'),
            data: {
                _token: access_token,
                comment_id: r.find('#comment_id').val(),
                emoji_id: r.find('#emoji_id').val()
            },
            dataType: "JSON",
        }).done(function (response) {
            r.parent().parent().toggleClass('scale')
            console.log(response.data.status)
        }).fail(function (response) {
            console.log(response.data.status)
        })

        e.preventDefault()
    })
    $('#document-edit-button').click(function (e) {
        e.preventDefault()
        $.ajax({
            url: $(this).attr('href')
        }).done(function () {
            window.history.pushState(null, null, $(this).attr('href'))
        })
    })

    $(document).on('click', '.reaction-smiles', function (e) {
        e.stopPropagation()
        let el = $(this)
        let r = el.find('.reaction-list-smiles')
        if (r) {
            if (r.hasClass('scale')) {
                r.removeClass('scale')
            } else {
                r.addClass('scale')
            }

        }
    })

    $(document).on('click', '.reaction-smiles-count-group', function (e) {
        e.stopPropagation()
        let el = $(this)
        let post_id = el.attr('data-post-id')

        let post = $('.container__form_[post-id="' + post_id + '"]')
        let reaction_block = post.find('.modal-data-people-reaction')
        let reaction_list = reaction_block.find('.modal-data-people-reaction-people')
        let reaction_block_all = reaction_block.find('.modal-data-people-users-container[reaction-id="all"]')

        let reactions = {
            'all': []
        }
        let codes = {
            'all': '',
        }

        $.ajax({
            type: 'GET',
            url: app_url + '/posts/' + post_id + '/reactions',
            data: {}
        }).done(function (response) {
            for (const [key, value] of Object.entries(response.data)) {
                let element = '<div class="modal-data-people-users-avatar" user-id="' + value.user.id + '">\n' +
                    '                                    <div class="icon-emotion-letter user-avatar" '
                if (value.user.avatar) {
                    element += 'style="background-image: url(' + value.user.avatar + ');"'
                }
                element += '>'
                if (!value.user.avatar) {
                    element += value.user.name.charAt(0)
                }
                element += '<div class="icon-emotion-user">\n' +
                    value.reaction.code +
                    '                                        </div>\n' +
                    '                                    </div>\n' +
                    '                                    <span>' + value.user.name + ' ' + value.user.last_name + '</span>\n' +
                    '                                </div>'

                reactions.all.push(element)
                let reaction_id = value.reaction.id
                if (!(reaction_id in reactions)) {
                    reactions[reaction_id] = []
                    codes[reaction_id] = value.reaction.code
                }
                reactions[reaction_id].push(element)

                let current_reaction_block = reaction_block.find('.modal-data-people-users-container[reaction-id="' + value.reaction.id + '"]')

                if (current_reaction_block.length === 0) {
                    let modal = '<div class="modal-data-people-users-container hide" reaction-id="' + value.reaction.id + '">' +
                        '<div class="modal-data-people-users">' +
                        ' </div>' +
                        ' </div>'
                    reaction_block_all.after(modal)
                }
            }
            for (const [key, value] of Object.entries(reactions)) {
                let block = reaction_block.find('.modal-data-people-users-container[reaction-id="' + key + '"]')

                block.find('.modal-data-people-users').html(value.join(' '))

                let reaction_header = reaction_list.find('.reaction-item[reaction-id="' + key + '"]')
                if (reaction_header.length === 0) {
                    let header = '<span class="reaction-item" reaction-id="' + key + '"><span>' + codes[key] + '</span> <span class="count">' + value.length + '</span></span>'
                    reaction_list.append(header)
                } else {
                    reaction_header.find('.count').html(value.length)
                }
            }
        }).fail(function (response) {
            console.log(response.data)
        })

        $(document).find('.modal-data-people-reaction[data-post-id="' + post_id + '"]').removeClass('hide')
    })
    $(document).on('click', '.modal-data-people-reaction', function (e) {
        e.stopPropagation()
    })
    $(document).on('click', '.modal-data-people-reaction .modal-data-people-reaction-cross', function () {
        let reaction_block = $(this).parent().parent()
        reaction_block.addClass('hide')
        let headers_block = reaction_block.find('.modal-data-people-reaction-people')

        headers_block.find('.reaction-item[reaction-id!="all"]').remove()
    })
    $(document).on('click', '.modal-data-people-reaction-people .reaction-item', function (e) {
        let menu = $(this)
        let reaction_id = menu.attr('reaction-id')
        let modal = menu.parent().parent()
        let reaction_content = modal.parent()
        let content = reaction_content.find('.modal-data-people-users-container[reaction-id="' + reaction_id + '"]')
        let active_content = reaction_content.find('.modal-data-people-users-container.active')
        let underline = modal.find('.underline')
        let activeMenu = modal.find('.reaction-item.active')
        activeMenu.removeClass('active')
        menu.addClass('active')
        active_content.removeClass('active')
        active_content.addClass('hide')
        content.addClass('active')
        content.removeClass('hide')
        underline.css('transform', `translateX(${e.target.offsetLeft - 34}px)`)
    })
})

$(document).on('click', '.searchClick', function (e) {
    e.stopPropagation()
    $('.organizations').addClass('hide')
    $('.user-feed').addClass('hide')
    $('.favorites').addClass('hide')
    $('.workspace').addClass('hide')
    $('.wrapper-search').removeClass('hide')
})

$(document).on('click', '.wrapper-search', function (e) {
    e.stopPropagation()
})

function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

const getSearchResults = async (value) => {
    const searchUrl = document.querySelector('#documents-search')?.action
    const data = await fetch(`${searchUrl}?search=${value}`)
        .then(response => {
            return response.text()
        })
    document.querySelector('.search-results').innerHTML = data
    return data
}

const getSearchWikiResults = async (value) => {
    const searchUrl = document.querySelector('#documents-search')?.action
    const data = await fetch(`${window.location.href}/search/documents?search=${value}&wiki=true`)
        .then(response => {
            return response.text()
        })
    document.querySelector('.search-wiki-results').innerHTML = data
    return data
}

$(document).on('keyup', '.move_file input', function (e) {
    let el = $(this)
    const returnedFunction = debounce(function () {
        getSearchWikiResults(el.val())
        console.log('deb')
    }, 1000, false);
    returnedFunction()
})

$(document).on('keyup', 'form.search input', function (e) {
    let el = $(this)
    const returnedFunction = debounce(function () {
        getSearchResults(el.val())
        console.log('deb')
    }, 1000, false);
    returnedFunction()
})


$(document).on('click', '.add-emoji-btn', function (e) {
    let smileBtn = $(this)
    const allPost = document.querySelectorAll('.post-list-item')


    e.stopPropagation()
    if (!emojiBlock) {
        let emojiHiddenBlock = document.querySelector('#emoji-route')
        if (emojiHiddenBlock && emojiHiddenBlock.dataset.emojiUrl) {
            emojiBlock = DocumentRequests.getEmojiBlock(emojiHiddenBlock.dataset.emojiUrl, 'edit-icon__list emoji-items-list')
            let emojiIcons = emojiBlock.querySelector('.edit-icon__icons')



            emojiIcons.addEventListener('click', e => {
                let commentForm = document.querySelector('.edit-icon__list.emoji-items-list').closest('form')
                if (e.target.classList.contains('edit-icon__item') && commentForm) {
                    let textArea = commentForm.querySelector('.textarea-comment') || commentForm.querySelector('.post-textarea')

                    if (textArea) {
                        textArea.value = textArea.value + e.target.innerText.replaceAll(' ', '').replaceAll('\n', '')
                    }
                }
            })
        }
    }

    let nextBlockWIthEmoji = smileBtn.next()
    if (nextBlockWIthEmoji.length === 0) {
        smileBtn.parent().append(emojiBlock)
        emojiBlock.classList.remove('hide')
    } else {
        let b_status = nextBlockWIthEmoji.hasClass('hide')
        if (b_status) {
            nextBlockWIthEmoji.removeClass('hide')
        } else {
            nextBlockWIthEmoji.addClass('hide')
        }
    }
    const lastElem = allPost[allPost?.length - 1]?.querySelector('.emoji-items-list')

    if(lastElem) {
        lastElem.classList.add('imojiLastElem')
    } else {
        document.querySelector('.emoji-items-list').classList.remove('imojiLastElem')
    }
})
if (document.querySelectorAll('.comments-sort')) {
    document.querySelectorAll('.comments-sort').forEach(r => {
        r.addEventListener('click', (e) => {
            e.stopPropagation()
            if (r.querySelector('.comments-sort-dropdown')) {
                r.querySelector('.comments-sort-dropdown').classList.toggle('hide')
            }
        })
    })
}

if (projectTextarea && postTextarea) {
    projectTextarea.addEventListener('input', function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + 'px'
    })

    postTextarea.addEventListener('input', function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + 'px'
    })
}

let booleen
if (wrapperCreateProject) {
    wrapperCreateProject.addEventListener('click', function (e) {
        e.stopPropagation()
        let proj = this.querySelector('#project-form-creat');
        let wiki = this.querySelector('#wiki-form-create')
        if (proj) {
            proj.classList.add('hide')
        }
        if (wiki) {
            wiki.classList.add('hide')
        }
        createProjectContainer.style.alignItems = 'start'
        document.querySelectorAll('.ck-button')?.forEach(r => r.addEventListener('click', e => {
            e.stopPropagation()
        }))
        document.querySelectorAll('.ck-toolbar')?.forEach(r => r.addEventListener('click', e => {
            e.stopPropagation()
        }))

        projectFormContainer.classList.remove('hide')
        document.body.addEventListener('click', () => {

            projectFormContainer.classList.add('hide')
            wrapperCreateProject.style.paddingBottom = '16px'
            createProjectContainer.style.alignItems = 'center'
            if (proj) {
                proj.classList.remove('hide')
            }
            if (wiki) {
                wiki.classList.remove('hide')
            }
        })
        if (!booleen) {
            projectTextarea.focus()
            booleen = true
        }

        wrapperCreateProject.style.paddingBottom = '0px'
    })
}


let booleenn

if (containerFeed) {
    containerFeed.querySelector('.wrapper-create-post:not(.wrapper-edit-post)').style.paddingBottom = '14px'
}
if (wpCreatePost) {
    wpCreatePost.addEventListener('click', function (e) {
        wpCreatePost.classList.add('create-post-active')
        if (!booleenn) {
            postContainer.querySelector('textarea').focus()
            booleenn = true
        }
    })
}

const customSelectWrapper = document.querySelectorAll('.custom-select-wrapper')
if (customSelectWrapper) {
    customSelectWrapper.forEach(r => {
        r.addEventListener('click', function () {
            const containerSelect = this.querySelector('.wrapper-custom-select')
            const selectedOption = this?.querySelector('.select-title-value')
            const arrowSelect = this?.querySelector('.select-arrow')
            const option = containerSelect?.querySelectorAll('.custom-select-list-option-value')
            selectedOption?.classList.toggle('selectActiveText')
            arrowSelect?.classList.toggle('selectActiveText')
            containerSelect?.classList.toggle('hide')

            option?.forEach(e => {
                e.addEventListener('click', function () {
                    selectedOption.style.color = '#333333'
                    arrowSelect.style.fill = '#333333'
                    selectedOption.innerText = this.innerText
                    containerSelect.querySelector('input').value = this.dataset.id
                })
            })

        })
    })
}

//------------------------------ User Profile ---------------------------------//
let activeItem = document.querySelector('#user-settings-personal')
let activeBlock = document.querySelector('.user-profile-change-name')
const activeBlockList = document.querySelectorAll('.content-block-tabs')
const userProfileTab = document.querySelector('.user-profile-tab')?.querySelectorAll('span')

if (userProfileTab) {
    userProfileTab.forEach((r, i) => {
        r.addEventListener('click', () => {
            activeItem.classList.remove('user-profile-tab-bg')
            r.classList.add('user-profile-tab-bg')
            activeItem = r
            activeBlockList.forEach((block, f) => {
                if (i === f) {
                    activeBlock.classList.add('hide')
                    block.classList.remove('hide')
                    activeBlock = block
                }
            })
        })
    })
}

// ---------------------------- Autosave on blur document's title input -------------------------------

if (title) {
    title.addEventListener('blur', () => {
        DocumentRequests.sendUpdateTitleRequest(access_token)
    })
}

try {
    CKEditor.initIdeaCKEditor(BalloonEditor)
} catch (e) {
    console.log(e.message)
}


const dropReminder = document.querySelector('.dropdown-reminder')
const bellSvgRew = document.querySelector('.bell-svg-rew')

if (bellSvgRew) {
    dropReminder.addEventListener('click', function(e) {
        e.stopPropagation()
    })
    bellSvgRew.addEventListener('click', (e) => {
        e.stopPropagation()
        dropReminder.classList.toggle('hide')
        bellSvgRew.querySelectorAll('.bell-header').forEach(el => el.classList.toggle('hide'))
        /* read notifications */

        if (!dropReminder.classList.contains('hide')) {
            let links = dropReminder.querySelectorAll('.wrapper-reaction-post .reaction-post-text a.read-notification')
            let ids = []
            links.forEach(r => {
                ids.push(r.getAttribute('data-notification-id'))
            })

            $.ajax({
                type: 'POST',
                url: app_url + '/notifications',
                data: {
                    _token: access_token,
                    ids: ids
                }
            }).done(function (response) {
                console.log(response.data.status)
                $('.wrapper-header .bell-svg-rew .bell-header-indicator').addClass('hide')
            }).fail(function (response) {
                console.log(response.data.status)
            })

        }
        /* end of read notifications */
    })
}


// ---------------------- Toggle document versions ------------------------

const OC = window.navigator.vendor.toLowerCase()
const updateBtn = document.querySelector('#update-document-btn')
let toggleBtn = document.querySelector('#toggle-document-version-btn')
const editorStyleAll = document.querySelectorAll('.common-editor-styles')
const editorStyleTruAll = document.querySelectorAll('.common-editor-true')

if (OC && updateBtn && toggleBtn && editorStyleAll && editorStyleTruAll) {
    if (OC.includes('apple')) {
        editorStyleAll.forEach(r => {
            r.classList.add('common-editor-styles_mac')
        })
    }

    editorStyleAll.forEach(r => {
        DelHeight_P_Empty(r)

    })

    if (editorStyleTruAll) {
        editorStyleTruAll.forEach(r => {
            DelHeight_P_Empty(r)
        })
    }

    function DelHeight_P_Empty(container) {
        const all_p_elem = container.querySelectorAll('p')
        if (all_p_elem.length !== 0) {
            all_p_elem.forEach(elem => {
                if (elem.innerText.length === 1) {
                    elem.style.height = '0px'
                } else {
                    elem.style.height = 'initial'
                }
            })
        }
    }


    toggleBtn.addEventListener('click', () => {
        if (!window.defaultDocumentCKEditor) {
            CKEditor.initDefaultDocumentCKEditor(BalloonEditor)
        }

        const editorStyleAll = document.querySelectorAll('.common-editor-styles:not(.common-editor-styles-user-draft)')
        const editorStyleTruAll = document.querySelectorAll('.common-editor-true:not(.common-editor-styles-user-draft)')
        documentContentLoad.classList.toggle('show-draft')

        if (window.contentTimer) {
            DocumentRequests.sendUpdateContentRequest(access_token, true)
        }
        // if (Laravel.documentId) {
        //     connectToUpdatingDocumentChannel(Laravel.documentId)
        // }

        if (editorStyleAll) {
            editorStyleAll.forEach(r => {
                DelHeight_P_Empty(r)
                r.classList.remove('common-editor-styles')
                r.classList.remove('common-editor-styles_mac')
                r.classList.add('common-editor-true_mac')
                r.classList.add('common-editor-true')
            })
        }
        if (editorStyleTruAll) {
            editorStyleTruAll.forEach(r => {
                DelHeight_P_Empty(r)
                r.classList.remove('common-editor-true')
                r.classList.add('common-editor-styles')
                r.classList.add('common-editor-styles_mac')
                r.classList.remove('common-editor-true_mac')
            })
        }
    })

    updateBtn.addEventListener('click', () => {

        const editorStyleAll = document.querySelectorAll('.common-editor-styles:not(.common-editor-styles-user-draft)')
        const editorStyleTruAll = document.querySelectorAll('.common-editor-true:not(.common-editor-styles-user-draft)')

        if (editorStyleAll) {
            editorStyleAll.forEach(r => {
                r.classList.remove('common-editor-styles')
                r.classList.add('common-editor-true')
            })
        }
        if (editorStyleTruAll) {
            editorStyleTruAll.forEach(r => {
                r.classList.remove('common-editor-true')
                r.classList.add('common-editor-styles')
            })
        }
    })

    if (Laravel.documentId && Laravel.documentNew === true) {
        toggleBtn.click()
    }
}

if (document.querySelector('.block-info-swiper-container')) {
    new Swiper('.block-info-swiper-container', {
        speed: 400,
        slidesPerView: 2.7,
        spaceBetween: 16,
    });
}


if (organizationsContentBg) {
    if (organizationsContentBg.closest('.nesting-block')) {
        const activeItemInMenu = organizationsContentBg?.closest('.nesting-block')
        activeItemInMenu.style.background = '#EDF4FF'
        activeItemInMenu.classList.add('liner-for-menu')
        activeItemInMenu.querySelector('svg').style.fill = '#3C84F0'
    }
    if (organizationsContentBg.closest('.organizations-content')) {
        const activeItemInMenu = organizationsContentBg.closest('.organizations-content')
        activeItemInMenu.style.background = '#EDF4FF'
        activeItemInMenu.classList.add('liner-for-menu')
        activeItemInMenu.querySelector('svg').style.fill = '#3C84F0'
    }
}

const buttonRight = document.querySelector('.list-buttons-edit')
const historyBlock = document.querySelector('.block-history-editor')

if (versionHistory) {
    versionHistory.addEventListener('click', function () {

        let url = versionHistory.dataset.contentUrl
        if ($('#user-draft-btn').text() === 'Hide draft version'){
            url += '?draft=true'
        }
        if (!documentHistory) {
            $.ajax({
                type: 'GET',
                url: url,
                async: false
            }).done(response => {
                documentHistory = response
                historyBlock.insertAdjacentHTML('beforeEnd', documentHistory)
            }).fail(function (response) {
                console.log(response.data.status)
            })
        }

        documentContentLoad.classList.toggle('versions-opened')
        this.classList.toggle('network-font-blue')
        if (this.innerText.includes('Show version history')) {
            this.innerText = 'Hide version history'

        } else {
            this.innerText = 'Show version history'
        }
        if (buttonRight) {
            buttonRight.classList.toggle('styleForButtonOpenHistory')
        }
        document.querySelector('.block-history-editor').classList.toggle('hide')
        if (srmDescriptionContentInnerNot) {
            document.querySelector('.srm-description__content-inner.git-current').classList.toggle('hide')
            srmDescriptionContentInnerNot.classList.toggle('hide')
        }
    })
}


const selectEditor = document.querySelector('.select-page-editor-wrapper')
if (selectEditor) {
    selectEditor.addEventListener('click', function () {
        this.querySelector('.select-page-editor-custom').classList.toggle('hide')
    })
}

const burger = document.querySelector('.burger-mobile')
const crossBurger = document.querySelector('.cross-burger')

if (burger) {
    burger.addEventListener('click', function (e) {
        e.stopPropagation()
        menu.classList.toggle('animationBurger')
        menu.classList.toggle('animationBurgerShadow')
        crossBurger.classList.remove('hide')
        mainContent.classList.add('bgContent')
        mainContent.classList.add('over')
    })
    if (crossBurger) {
        crossBurger.addEventListener('click', function () {
            crossBurger.classList.add('hide')
            menu.classList.toggle('animationBurger')
            menu.classList.toggle('animationBurgerShadow')
            mainContent.classList.remove('bgContent')
            mainContent.classList.remove('over')
        })
    }
}

const wrapperNetwork = document.querySelectorAll('.wrapper-network')
if (wrapperNetwork) {
    wrapperNetwork.forEach(r => {
        const flexibleNetwork = r.querySelectorAll('.flexible-icon-network')
        let activeIcon = r.querySelector('.groundBlue')
        let activeSvg = r.querySelector('.white-style-svg')
        let activeText = r.querySelector('.network-font-blue')
        if (flexibleNetwork) {
            flexibleNetwork.forEach((icon, i) => {
                icon.addEventListener('click', function () {
                    if (activeIcon !== this.querySelector('.network-icon')) {
                        activeIcon.classList.remove('groundBlue')
                        activeIcon.classList.add('groundGray')
                        activeIcon = this.querySelector('.network-icon')
                        this.querySelector('.network-icon').classList.remove('groundGray')
                        this.querySelector('.network-icon').classList.add('groundBlue')

                        if (i === 0) {
                            this.querySelector('.svg-id').classList.add('white-style-svg')
                            activeSvg.classList.remove('white-style-facebook')
                        } else {
                            this.querySelector('.svg-id').classList.add('white-style-facebook')
                            activeSvg.classList.remove('white-style-svg')
                            activeSvg.classList.remove('white-style-facebook')
                        }
                        activeSvg = this.querySelector('.svg-id')
                        this.querySelector('.text-id').classList.add('network-font-blue')
                        activeText.classList.remove('network-font-blue')
                        activeText = this.querySelector('.text-id')
                    }
                })
            })
        }
    })
}

const dropdownHistory = document.querySelector('.dropdown-history')

if (dropdownHistory) {
    dropdownHistory.addEventListener('click', function (e) {
        e.stopPropagation()
        const breadCrumb = this.querySelector('.history-breadcrumb')
        if (breadCrumb) {
            breadCrumb.classList.toggle('hide')
        }
    })
}

const reactionRound = document.querySelectorAll('.share-mobile')

if (reactionRound) {
    let activeShare
    reactionRound.forEach(r => {
        r.addEventListener('click', function (e) {
            e.stopPropagation()
            const shareWindow = this.querySelector('.share-window')
            if (shareWindow) {
                shareWindow.classList.toggle('hide')
            }
            if (activeShare && activeShare !== shareWindow) {
                activeShare.classList.add('hide')
            }

            activeShare = shareWindow
        })
    })
}

const comeBack = document.querySelectorAll('.document-mobile-reaction')
if (comeBack) {
    comeBack.forEach(r => r.addEventListener('click', () => {
        document.querySelectorAll('.modal-data-people-reaction').forEach(f => f.classList.add('hide'))
    }))
}

const breadCrumbAll = document.querySelectorAll('.container-srm')

if (breadCrumbAll) {
    breadCrumbAll.forEach(r => {
        r.addEventListener('click', function () {
            const linkCrumb = this.querySelector('a')?.href
            const dot = this.querySelector('span')?.innerText

            if (linkCrumb && dot !== '..') {
                window.location.href = linkCrumb
            }
        })
    })
}

//-----------------drop down Menu-user--------------------------------

const menuUser = document.querySelector('.menu-user')

if (windowWidth <= 1024) {
    menuDropDown.classList.remove('hide')
}

if (menuUser && menuDropDown) {
    menuUser.addEventListener('click', function (e) {
        e.stopPropagation()
        if (windowWidth >= 1024 || windowResizeWidth >= 1024) {
            menuDropDown.classList.toggle('hide')
        }

        if (windowWidth <= 1024 || windowResizeWidth <= 1024) {
            menuDropDown.classList.remove('hide')
            menu.classList.toggle('menu_overflow_of')
            menuDropDown.classList.toggle('menuDropDownMobActive')
        }
    })
    if (menuUser.querySelectorAll('li')) {
        menuUser.querySelectorAll('li').forEach(r => {
            r.addEventListener('click', function () {
                const link = this.querySelector('a')?.href
                const textValue = this.querySelector('a').innerText.toLowerCase()

                if (link && textValue !== 'exit') {
                    window.location.href = link
                } else if (textValue === 'exit') {
                    this.querySelector('a').click()
                }
            })
        })
    }
}


//-----------------drop down share-menu header--------------------------------

const shareIconMobile = document.querySelector('.share-icon-mobile')

if (shareIconMobile) {
    shareIconMobile.addEventListener('click', function (e) {
        e.stopPropagation()
        const parrentDiv = this.closest('.container-share')
        parrentDiv.querySelector('.share-window').classList.toggle('hide')
    })
}

$(document).on('click', '.comment-icon-new', function (e) {
    e.stopPropagation()
    $(this).closest('.container__form_')
        .find('.wrapper-write-comment.crutch')
        .find('.comment-form-textarea.textarea-comment')
        .focus()
})
$(document).on('click', '.share-new', function (e) {
    e.stopPropagation()
    let item = $(this).find('.share-window')
    item.toggleClass('hide')
})

const containerIcon = document.querySelector('.container-icon')

if (containerIcon) {
    containerIcon.addEventListener('click', function (e) {
        e.stopPropagation()
        const dropSocialForm = this.querySelector('.drop-social-form')
        let fc
        let rd
        let fcFor
        let redFor
        const changeTransform = () => {
            if (fc && redFor) {
                redFor.style.transform = 'translateX(12px)'
            } else if (!fc && redFor) {
                redFor.style.transform = 'translateX(6px)'
            }
        }
        if (dropSocialForm) {
            dropSocialForm.addEventListener('click', function (e) {
                e.stopPropagation()
            })
        }

        let fcForm = dropSocialForm.querySelector('.fc')
        if (fcForm) {
            fcForm.addEventListener('change', (e) => {
                fcFor = document.querySelector('.fc-for')
                if (e.target.checked) {
                    e.target.setAttribute('checked', 'checked')
                    fc = e.target.checked
                    fcFor.classList.remove('hide')
                } else {
                    e.target.removeAttribute('checked')
                    fc = e.target.checked
                    fcFor.classList.add('hide')
                }

                changeTransform()
            })
        }
        let rdForm = dropSocialForm.querySelector('.rd')
        if (rdForm) {
            rdForm.addEventListener('change', (e) => {
                if (User.reddit === false) {
                    window.open(app_url + '/social/reddit')
                    User.reddit = true
                }
                redFor = document.querySelector('.red-for')
                if (e.target.checked) {
                    e.target.setAttribute('checked', 'checked')
                    rd = e.target.checked
                    redFor.classList.remove('hide')
                } else {
                    e.target.removeAttribute('checked')
                    rd = e.target.checked
                    redFor.classList.add('hide')
                }
                changeTransform()
            })
        }
        dropSocialForm.classList.toggle('hide')
    })
}

$(document).ready(function ($) {
    $('.my-masonry-grid').masonryGrid({
        'columns': 2
    });
});

const historyButtonMobile = document.querySelector('.history_button_mobile')

if (historyButtonMobile) {
    historyButtonMobile.addEventListener('click', function () {
        document.querySelector('.block-history-editor').classList.toggle('hide')
        versionHistory.classList.toggle('network-font-blue')
    })
}

//TODO part for mobile
let flagOnework = true

function chatsListener(e) {
    console.log(1)
    console.log(e)
}

document.addEventListener("DOMContentLoaded", function (event) {
    if (windowWidth <= 768) {
        const chats_users = document.querySelectorAll('.user-chat')

        if (chats_users) {
            chats_users.forEach(el => {
                el.addEventListener('click', chatsListener)
            })
        }
    }
});

window.addEventListener('resize', function () {
    windowResizeWidth = this.innerWidth

    if (windowResizeWidth <= 1024) {
        menuDropDown.classList.remove('hide')
    }

    if (windowResizeWidth <= 768 && flagOnework) {
        flagOnework = false
    } else if (!flagOnework && windowResizeWidth >= 768) flagOnework = true

})

//TODO part for mobile

$('.toggle-list__btn').click(function () {
    let toggleList = $(this).closest('.toggle-list')
    let toggleListTrigger = $(toggleList).find('.toggle-list__trigger-block').first()

    toggleListTrigger.toggleClass('toggle-list__trigger-block--hidden')
    toggleListTrigger.toggleClass('toggle-list__trigger-block--default')
})


$('.task__btn').click(function () {
    let task = $(this).closest('.task')
    let taskTrigger = $(task).find('.task__trigger-block').first()

    taskTrigger.toggleClass('task__trigger-block--hidden')
    taskTrigger.toggleClass('task__trigger-block--default')
})


const news_filter_tabs = document.querySelector('.news_filter_tabs')

if(news_filter_tabs) {
    news_filter_tabs.querySelectorAll('span').forEach(el => {
        el.addEventListener('click', function (){
            news_filter_tabs.querySelector('.active_filter_news').classList.remove('active_filter_news')
            this.classList.add('active_filter_news')
        })
    })
}

if(projectTextarea) {
    projectTextarea.addEventListener('input', function(e) {
        document.querySelector('#project-form-creat')?.classList.add('hidden')
        document.querySelector('#wiki-form-create')?.classList.add('hidden')
        document.querySelector('.create-project-container').classList.add('alignItems')
    })
}

// input file comment

// const blockSvgFile = document.querySelector('.input_file-comment')
//
// if(blockSvgFile) {
//     blockSvgFile.addEventListener('click', function() {
//         this.querySelector('input').click()
//     })
// }

const showUserDraftBtn = document.querySelector('#user-draft-btn')
if (showUserDraftBtn){
    showUserDraftBtn.addEventListener('click', () => {
        documentContentLoad.classList.toggle('show-user-draft')
        let main_history_block = $('.history-block-main')
        let user_history_block = $('.history-block-user')
        if(showUserDraftBtn.textContent === 'Show draft version'){
            showUserDraftBtn.textContent = 'Hide draft version'
            main_history_block.addClass('hide')
            user_history_block.removeClass('hide')
        } else {
            showUserDraftBtn.textContent = 'Show draft version'
            user_history_block.addClass('hide')
            main_history_block.removeClass('hide')
        }
    })
}
