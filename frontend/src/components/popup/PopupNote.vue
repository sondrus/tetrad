<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="newNoteStore.close()"
      @cancel="newNoteStore.close()"
      >
      <form class="inner" ref="refForm" action="#" method="get"
        @submit="onSubmit"
        @submit.prevent="onSubmitPrevent"
      >

        <PopupHeader :title="popupTitle" />

        <div class="contents">
            
          <div class="field field_title">

            <!--
            <button type="button"
              :class="['noteicon', 'icon', {
                file: true,
              }]"
              @click="iconStore.showDialog(newNoteStore.noteData.icon, true)"
            ></button>
            -->

            <input type="text" :placeholder="$t('popup_parent.title_placeholder')" data-role="title" required
              v-model="newNoteStore.noteData.title" />

            <button type="button"
              :title="$t(`popup_parent.readonly_${newNoteStore.noteData.readonly ? 'y' : 'n'}`)"
              :class="['readonly', 'icon', {
                down: newNoteStore.noteData.readonly,
                pencil: !newNoteStore.noteData.readonly,
                restrict: newNoteStore.noteData.readonly,
              }]"
              @click="newNoteStore.noteData.readonly = !newNoteStore.noteData.readonly"
            ></button>

          </div>

          <div class="field field_parent">
            <input type="hidden" :value="newNoteStore.targetId" />

            <button type="button" @click="newNoteStore.showSelectParent"
              :title="parentTitle"
            >
              <template v-if="newNoteStore.targetId">
                <span class="icon" :class="parentIcon"></span>
                <span class="id">[{{ newNoteStore.targetId }}]</span>
                <span class="title">{{ parentTitle }}</span>
              </template>
              <template v-else>
                <span class="icon root"></span>
                <span class="title">{{$t('popup_parent.target_root')}}</span>
              </template>
            </button>

          </div>

          <div class="field field_type">

            <select v-model="newNoteStore.noteData.type"
              :title="$t('popup_parent.type')"
            >
              <option value="MD">{{$t('types.MD')}}</option>
              <option value="CODE">{{$t('types.CODE')}}</option>
              <option value="HTML">{{$t('types.HTML')}}</option>
              <option value="IFRAME">{{$t('types.IFRAME')}}</option>
              <option value="TEXT">{{$t('types.TEXT')}}</option>
              <option value="URL">{{$t('types.URL')}}</option>
            </select>

            <input type="text" :placeholder="$t('popup_parent.note_url')" data-role="url"
              v-if="newNoteStore.noteData.type == 'URL'"
              :required="newNoteStore.noteData.type == 'URL'"
              v-model="newNoteStore.noteData.url" />

            <select :title="$t('popup_parent.note_syntax')" data-role="syntax"
              v-if="newNoteStore.noteData.type == 'CODE'"
              :required="newNoteStore.noteData.type == 'CODE'"
              v-model="newNoteStore.noteData.syntax"
            >
              <option value="">---</option>
              <optgroup v-for="(languages, group) in groupedLanguages" :key="group" :label="group.toString()">
                <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
              </optgroup>
            </select>

          </div>

        </div>

        <PopupFooter :actions="popupButtons" />

      </form>

    </dialog>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import hljs from 'highlight.js'

import { useNewNoteStore } from '@/stores/newNoteStore'
import { useNotesStore } from '@/stores/notesStore'

import PopupHeader from '@/components/popup/parts/PopupHeader.vue'
import PopupFooter from '@/components/popup/parts/PopupFooter.vue'

const notesStore = useNotesStore()
const newNoteStore = useNewNoteStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()
const refForm = ref<HTMLFormElement>()

// Popup title
const popupTitle = computed(() =>
  newNoteStore.noteData.id
    ? `Edit note #${newNoteStore.noteData.id}`
    : 'Add new note'
)

// Popup buttons
const popupButtons = [
  {
    lang: 'btn_ok',
    icon: 'check',
    type: 'submit' as const,
  },
  {
    lang: 'btn_cancel',
    icon: 'cancel',
    type: 'button' as const,
    onClick: () => newNoteStore.close(),
  },
]

const parentTitle = computed(() => {
  return notesStore.notesMap.get(newNoteStore.targetId)?.title || ''
});

const parentIcon = computed(() => {
  const note = notesStore.notesMap.get(newNoteStore.targetId)
  if(!note){
    return 'file';
  }

  if(note.icon){
    return `icon-${note.icon}`;
  }
  
  const left = note.left ?? 0
  const right = note.right ?? 0
  if(right - left <= 1){
    return 'file';
  }

  return 'folder'
});

// Get languages of hljs grouped by first char for <select>
const groupedLanguages = computed(() => {
  return groupLanguages(hljs.listLanguages());
});

// Group function by first char
const groupLanguages = (languages: string[]) => {
  const grouped: { [key: string]: string[] } = {};

  languages.forEach((lang) => {
    const firstChar = lang.charAt(0).toUpperCase();
    const group = /^[A-Z]$/.test(firstChar) ? firstChar : '#';

    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(lang);
  });

  const sortedGrouped = Object.keys(grouped)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = grouped[key];
      return sortedObj;
    }, {} as { [key: string]: string[] });

  return sortedGrouped;
}

// Handle submit form
const onSubmit = async (event: Event) => {
  event.preventDefault()

  // Init save note object
  const note = {
    id: newNoteStore.noteData.id,
    parentId: newNoteStore.targetId,
    title: newNoteStore.noteData.title,
    type: newNoteStore.noteData.type,
    url: newNoteStore.noteData.url,
    icon: newNoteStore.noteData.icon,
    expanded: newNoteStore.noteData.expanded,
    readonly: newNoteStore.noteData.readonly,
    syntax: newNoteStore.noteData.syntax,
  }

  // Save
  const saved = await notesStore.saveNote(note)
  if(!saved){
    alert(`Error saving note`);
    return
  }

  newNoteStore.close()
};

const onSubmitPrevent = () => {
  return
};

// Auto open when isOpen=true and auto close when isOpen=false
watch(() => newNoteStore.isOpen, (isOpen) => {
    if (!refDialog.value) {
      return
    }

    // Open
    if (isOpen && !refDialog.value.open) {
      newNoteStore.noteData.type = newNoteStore.noteData.type || 'MD'
      refDialog.value.showModal()
    }

    // Close
    else if (!isOpen && refDialog.value.open) {
      refDialog.value.close()
    }

  },
)
</script>

<style scoped>
dialog {
  height: 250px;
  width: 360px;
}

.field_title {
  display: flex;
}
.field_title > button {
  flex: 0 0 32px;
  height: 32px;
  width: 32px;
}
/* .field_title > button.noteicon {
	background-size: var(--tetrad-height-icons-s);
} */
.field_title > button.readonly {
	background-size: var(--tetrad-height-icons-m);
}
.field_title > input[type=text] {
  flex: 1 1 auto;
  margin-right: 10px;
  padding: 0 10px;
}

.field_parent button {
  display: flex;
  width: 100%;
}
.field_parent button span {
  flex: 0 0 auto;
  overflow: hidden;
  padding-top: 1px;
  text-align: left;
  white-space: nowrap;
}
.field_parent button span + span:not(:empty) {
  margin-left: 8px;
}
.field_parent button span.title {
  flex: 0 1 100%;
  text-overflow: ellipsis;
}

.field_type {
  display: flex;
  width: 100%;
}
.field_type select {
  flex: 1 1 180px;
  width: 100%;
}
.field_type select + * {
  flex: 1 1 auto;
  margin-left: 10px;
}
</style>
